# JioCloud Client SDK – Usage Guide

This SDK allows you to interact with JioCloud services.

---

## 📦 Installation

```bash
npm install jiocloud-node
```
---

## 📄 Importing the SDK

```js
const jiocloud = require('jiocloud-node');
```

---

## 🔐 Authentication

### Authenticate via Mobile OTP

```js
await jiocloud.auth({ mobileNumber: '9876543210' });
```

### Authenticate via Email OTP

```js
await jiocloud.authEmail({ email: 'user@example.com' });
```

> Both methods will prompt you in the terminal to enter the OTP sent to your mobile/email.

---

## 📁 File Operations

### Upload a File

```js
const result = await jiocloud.upload('./documents/report.pdf');
console.log('Upload Result:', result);
```

### Download a File

```js
await jiocloud.download('objectKey123', './downloads');
console.log('File downloaded successfully.');
```

### List All Files

```js
const files = await jiocloud.getFiles();
console.log('Files:', files);
```

---

## 🔓 Logout

```js
jiocloud.logout();
console.log('User logged out.');
```

> This will also stop the automatic token refresh process.

---

## ⚙️ Session Context

You can access the current session information (such as session ID, device key, etc.):

```js
const context = jiocloud.getContext();
console.log('Session Info:', context);
```

---


## ✅ Example: Full Authentication and Upload Flow

```js
const jiocloud = require('jiocloud-node');

async function main() {
  try {
    await jiocloud.auth({ mobileNumber: '9876543210' });

    const files = await jiocloud.getFiles();
    console.log('Current Files:', files);

    const result = await jiocloud.upload('./test.txt');
    console.log('Upload complete:', result);

    await jiocloud.download('test.txt', './downloads');

    jiocloud.logout();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
```
