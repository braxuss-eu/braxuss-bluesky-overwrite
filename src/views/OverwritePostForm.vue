<template>
  <img
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABzklEQVR4nO2WuUpDQRSGv15TaaHGhbjmDXwIl9rlCdRYiD6DvZ2KlZVbbNT4BL6CkspeEFyLGINy4L8wxFzvzES7/HDgcs86Z84y0EEHYRgCSsA1cAe8iey7AqwBg/wD8sAeUAe+MqgBnAAjf+V8HniR8RpwBCwAU0CXyL4XxatJ1nTm2nW+rhN96VQFD51R4MzJhl1Z9MkbwCewEaG/Kd1GTCbyTtpjnLtBmI1noD9E8cBJeytYpZ8qSKMyMJEiW5YtK2LvVvtUMRVSnD+2qP5HZa4ZY7JVT+H/QEkGraJb4VT8Cxk0utS/4xSdE/FX8UBFwtZWrZDURr4pa/bvKUVnWXwLNBNVCU/ij2HpPKTwp8S3iZmJFwnnPJ1PAzfSOUyRyTnD6U8D2HaK8P6XPRAUQDXgCt4la4H0/CIXdAWVjCJ0kZw+C0FFuJbRhjFI2nDFR3hQQ6OmxdJuBsZDB5FhX4Ztq7UbwLlkdgnAgNMNtlBiseUMqL5Q5TlnHW9GOk/W8QyRKDkPkrIWCx53nqS9oaJuC7Pa58mTzCp6CSgC3aKiWs0W1YeT9uiTN6MX2PF8lNa1+4MeIL7Iq5evgFvgVXSrIbMS0moddGD4Blc2q7CZjE3wAAAAAElFTkSuQmCC"
    alt="help" v-if="!helpShown" @click="setHelpShown(true)" style="filter: drop-shadow(silver 0px 0px 5px);" />
  <div class="instructions" v-if="helpShown">
    <p>If you want to edit a post without losing it's position in a thread or the answers you can overwrite it with
      this tool:</p>
    <ol>
      <li>Start by creating a new post with the content that you want to use. That will be the "source" post.</li>
      <li>This tool will overwrite the "target" post with the content of the "source" post when you say so.</li>
      <li>Then you can delete the "source" one, it's no longer needed.</li>
    </ol>
    <br />
    <button @click="setHelpShown(false)">Dismiss help</button>
  </div>

  <div class="overwrite-form">
    <form @submit.prevent="" v-if="!success">
      <div class="form-group">
        <label for="source">Content source (your post with the correct content):</label>
        <input type="search" id="source" v-model="sourceUrl" ref="sourceInput" :disabled="!formEnabled" />
        <div class="error">{{ sourceError }}</div>
      </div>
      <div class="form-group">
        <label for="target">Target (the post you want to overwrite):</label>
        <input type="search" id="target" v-model="targetUrl" ref="targetInput" :disabled="!formEnabled" />
        <div class="error">{{ targetError }}</div>
      </div>
      <button @click="submit" :disabled="!formEnabled" class="overwrite-button">Overwrite</button>
      <button @click="reset" :disabled="loading" class="reset-button">Reset and start over</button>
    </form>
    <div v-if="success" style="overflow: hidden; line-break: anywhere;">
      <p style="font-weight: bold;">The target post was sucessfully overwritten!!</p>
      <br />
      <div>
        <label for="sourceLink">Post used as content source (you can delete it now):</label>
        <a id="sourceLink" target="_blank" :href="sourceUrl">{{ sourceUrl }}</a>
      </div>
      <br />
      <div>
        <label for="targetLink">Ovewritten post:</label>
        <a id="targetLink" target="_blank" :href="targetUrl">{{ targetUrl }}</a>
      </div>
      <br />
      <div>
        <button @click="reset" :disabled="loading" class="reset-button">Reset and start over</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { CredentialManager, XRPC } from "@atcute/client";
import {
  configureOAuth,
  createAuthorizationUrl,
  finalizeAuthorization,
  getSession,
  OAuthUserAgent,
  resolveFromIdentity
} from "@atcute/oauth-browser-client";
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const $toast = useToast({ position: 'top-right' });

configureOAuth({
  metadata: {
    client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  }
});

const handleLogin = async () => {
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.has("state") && (params.has("code") || params.has("error"))) {
    history.replaceState(null, "", location.pathname + location.search);
    const session = await finalizeAuthorization(params);
    return session.info.sub;
  } else {
    return null;
  }
};

const savedState = JSON.parse(localStorage.getItem("savedState") || "{}");
localStorage.removeItem("savedState");

var did = null;
onMounted(async () => {
  did = await handleLogin();
  const action = savedState.action || null;
  if (action == "overwrite") {
    setTimeout(submit, 0);
  }
});

const sourceUrl = ref(savedState.sourceUrl || '');
const targetUrl = ref(savedState.targetUrl || '');
const sourceError = ref('');
const targetError = ref('');
const formEnabled = ref(savedState?.action ? false : true);
const loading = ref(savedState?.action ? true : false);
const success = ref(false);
const helpShown = ref(JSON.parse(localStorage.getItem("helpShown") || "true"));

const bskyPostPattern = /^https:[/]{2}[^/]+[/]profile[/]([^/]+)[/]post[/](.*)$/;

const setHelpShown = (value) => {
  helpShown.value = value;
  localStorage.setItem("helpShown", JSON.stringify(value));
};

const reset = async () => {
  sourceUrl.value = '';
  targetUrl.value = '';
  sourceError.value = '';
  targetError.value = '';
  formEnabled.value = true;
  loading.value = false;
  success.value = false;
}

const submit = async () => {
  formEnabled.value = false;
  loading.value = true;
  await new Promise(r => setTimeout(r, 0));
  $toast.info('Making some checks...');
  sourceError.value = '';
  targetError.value = '';
  var ok = true;
  if (!sourceUrl.value) {
    sourceError.value = 'Source post address is required';
    ok = false;
  } else {
    if (!bskyPostPattern.test(sourceUrl.value)) {
      sourceError.value = `Doesn't look like a Bluesky post address. Example: https://bsky.app/profile/braxuss.eu/post/3lczelxxvgs2b`;
      ok = false;
    }
  }
  if (!targetUrl.value) {
    targetError.value = 'Target post address is required';
    ok = false;
  } else {
    if (!bskyPostPattern.test(targetUrl.value)) {
      targetError.value = `Doesn't look like a Bluesky post address. Example: https://bsky.app/profile/braxuss.eu/post/3lczelxxvgs2b`;
      ok = false;
    }
  }
  var sourceMatch, targetMatch;
  if (ok) {
    sourceMatch = sourceUrl.value.match(bskyPostPattern);
    targetMatch = targetUrl.value.match(bskyPostPattern);
    if (sourceMatch[2] == targetMatch[2]) {
      sourceError.value = 'Source and target posts must be different';
      targetError.value = 'Source and target posts must be different';
      ok = false;
    }
  }
  $toast.clear();
  var handle;
  if (ok) {
    const didOrHandle = sourceUrl.value.match(bskyPostPattern)[1];
    const resolvePDS = async (did) => {
      const diddoc = await (await fetch(
        did.startsWith("did:web") ?
          `https://${did.split(":")[2]}/.well-known/did.json`
          : "https://plc.directory/" + did,
      )).json();
      const pds = diddoc?.service?.find(s => s.type == 'AtprotoPersonalDataServer')?.serviceEndpoint;
      if (!pds) throw new Error("No PDS found");
      return pds;
    };
    var rpc = new XRPC({
      handler: new CredentialManager({ service: "https://public.api.bsky.app" }),
    });
    const resolveHandle = async (handle) => {
      const res = await rpc.get("com.atproto.identity.resolveHandle", {
        params: { handle },
      });
      return res.data.did;
    };
    const getDidHandle = async (did) => {
      const res = await rpc.get("app.bsky.actor.getProfile", {
        params: { actor: did },
      });
      return res.data.handle;
    };
    $toast.clear();
    $toast.info('Making checks (1)...');
    if (didOrHandle.startsWith("did:")) {
      did = didOrHandle;
    } else {
      did = await resolveHandle(didOrHandle);
    };
    const pds = await resolvePDS(did);
    $toast.clear();
    $toast.info('Making checks (2)...');
    handle = await getDidHandle(did);
    var sourceRecord, targetRecord;
    const getPost = (repo, rkey) =>
      rpc.get('com.atproto.repo.getRecord', {
        params: { repo: repo, collection: 'app.bsky.feed.post', rkey: rkey },
      }).then(r => r?.data).catch(e => {
        console.error("getPost error", JSON.parse(JSON.stringify(e)));
        if (e.kind == "RecordNotFound") {
          return null;
        } else {
          throw e;
        }
      });
    $toast.clear();
    $toast.info('Making checks (3)...');

    /** @type { XRPC } */
    rpc = new XRPC({ handler: new CredentialManager({ service: pds }) });
    sourceRecord = await getPost(sourceMatch[1], sourceMatch[2]);
    if (!sourceRecord) {
      sourceError.value = 'Source post not found';
      ok = false;
    }
    targetRecord = await getPost(targetMatch[1], targetMatch[2]);
    if (!targetRecord) {
      targetError.value = 'Target post not found';
      ok = false;
    }
  }
  if (ok) {
    if (!((sourceMatch[1] == targetMatch[1]) || (sourceMatch[1] == did && targetMatch[1]) == handle || (sourceMatch[1] == handle && targetMatch[1] == did))) {
      sourceError.value = 'Source and target posts must belong to the same account: ' + sourceMatch[1];
      targetError.value = 'Source and target posts must belong to the same account' + targetMatch[1];
      ok = false;
    }
  }
  if (ok) {
    if (sourceRecord.value.reply) {
      sourceError.value = 'Please use a single post with your wanted content as source, not a reply.';
      ok = false;
    }
  }
  $toast.clear();
  if (ok) {
    $toast.info('Making checks (4)...');
    const session = await getSession(did, { allowStale: true }).catch(e => {
      console.error("getSession error", JSON.parse(JSON.stringify(e)));
      return null;
    });
    if (!session) {
      $toast.info('Need to log in...');
      console.error("Need to log in", handle, did);
      try {
        const resolved = await resolveFromIdentity(handle);
        const authUrl = await createAuthorizationUrl({
          scope: import.meta.env.VITE_OAUTH_SCOPE,
          ...resolved,
        });
        localStorage.setItem("savedState", JSON.stringify({
          sourceUrl: sourceUrl.value,
          targetUrl: targetUrl.value,
          action: "overwrite",
          helpShown: helpShown.value,
        }));
        setTimeout(() => location.assign(authUrl), 100);
        return;
      } catch (e) {
        console.error(e);
        // TODO display error?
      }
      ok = false;
    } else {
      try {
        $toast.info('Logged in.');
        $toast.info('Overwriting post...');
        const agent = new OAuthUserAgent(session);
        rpc = new XRPC({ handler: agent });
        // Prepare the new record
        console.log("Overwriting", sourceMatch[2], "with", targetMatch[2]);
        console.log("Source", sourceRecord);
        console.log("Target", targetRecord);
        const newRecord = { ...sourceRecord };
        if (targetRecord.value.reply) {
          newRecord.value.reply = targetRecord.value.reply;
        } else {
          delete newRecord.value.reply;
        }
        newRecord.value.createdAt = new Date().toISOString();
        console.log("New record", newRecord);
        // Do the overwrite
        await rpc.call("com.atproto.repo.applyWrites", {
          data: {
            repo: did,
            validate: true,
            writes: [
              {
                collection: 'app.bsky.feed.post',
                rkey: targetMatch[2],
                $type: "com.atproto.repo.applyWrites#delete",
              },
              {
                collection: 'app.bsky.feed.post',
                rkey: targetMatch[2],
                $type: "com.atproto.repo.applyWrites#create",
                value: newRecord.value,
              },
            ],
          },
        });
        $toast.clear();
        $toast.success('Post overwritten!!');
        $toast.info('You can now delete the source post.');
        helpShown.value = false;
      } catch (e) {
        console.error(e);
        ok = false;
      }
    }
  }
  success.value = ok;
  loading.value = false;
  if (!ok) {
    $toast.clear();
    $toast.error('There was an error. Please check the form and try again.');
    formEnabled.value = true;
  }
};

</script>

<style scoped>
.overwrite-form {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

@media (width < 600px) {
  .overwrite-form {
    padding: 5px !important;
  }
}

.instructions {
  width: 100%;
  margin: auto auto 1em auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: small;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="search"] {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}

.error {
  color: red;
  line-height: 2ch;
  min-height: 2ch;
  word-wrap: break-word;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: rgb(32, 93, 207);
  color: white;
}

button.overwrite-button {
  color: white;
  background-color: #e74900
}

button.overwrite-button:hover {
  background-color: #f85a11
}

button.overwrite-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button.reset-button {
  color: white;
  background-color: #ff7f00;
}

button.reset-button:hover {
  background-color: #ff8a15;
}

button.reset-button:disabled {
  background-color: #cccccc;
}
</style>
