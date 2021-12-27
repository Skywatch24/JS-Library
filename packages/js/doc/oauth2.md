# Oauth 2.0

### 1. Get `code` from Authorization URL:

Open this URL below in the web browser.

```
service.skywatch24.com/oauth2?app_id='app_ip'&redirect_uri='redirect_uri'
```

When user grants authorization, the website will redirect to the `redirect_url` and contain `code` in the url.

| Parameter      | Type     | Required | Description                                                         |
| -------------- | -------- | -------- | ------------------------------------------------------------------- |
| `app_id`       | `string` | YES      | The `app_id` is a public identifier for your skywatch applications. |
| `redirect_url` | `string` | YES      | The URL that you want to receive the authorization code.            |

### 2. Get `access_token` via `code`

```
curl -X "POST" "https://service.skywatch24.com/api/general/oauth_access_token.php" \
-H 'Content-Type:application/x-www-form-urlencoded;' \
--data-urlencode "app_id=xxxx" \
--data-urlencode "app_secret=xxxx" \
--data-urlencode "code=xxxx" \
--data-urlencode "method_type=POST"
```

| Parameter    | Type     | Required | Description                                                                              |
| ------------ | -------- | -------- | ---------------------------------------------------------------------------------------- |
| `app_id`     | `string` | YES      | The `app_id` is a public identifier for your skywatch applications.                      |
| `app_secret` | `string` | YES      | The `app_secret` is a secret known only to the application and the authorization server. |
| `code`       | `string` | YES      | The authorization code comes from previous oauth2 URL.                                   |

### 3. Initialize `access_token` in JS library

This is a function which has to initiate at the beginning.

```javascript
import Skywatch from '@skywatch/js';
Skywatch.initialize('/your_server_url_with_skywatch_library', 'token');
```

### Example & Demo:

[Click this link](https://skywatch24.github.io/JS-Library/)
