# QRcode Access

### QRcode List

```javascript
Skywatch.Lock.getQRcodeList();
```

### Always QRcode

```javascript
Skywatch.Lock.createAlwaysQRcode(deviceIds, name, passcode, email);
```

| Property    | Type     | Required | Description                           |
| ----------- | -------- | -------- | ------------------------------------- |
| `deviceIds` | `array`  | YES      | Lock id list ex. `['59974', '59998']` |
| `name`      | `string` | YES      | passcode name                         |
| `passcode`  | `string` | YES      | Passcode (4 - 8 digits)               |
| `email`     | `string` | Optional | Send passcode notification to eamil   |

### Onetime QRcode

```javascript
Skywatch.Lock.createOnetimeQRcode(deviceIds, name, passcode, email);
```

| Property    | Type     | Required | Description                           |
| ----------- | -------- | -------- | ------------------------------------- |
| `deviceIds` | `array`  | YES      | Lock id list ex. `['59974', '59998']` |
| `name`      | `string` | YES      | passcode name                         |
| `passcode`  | `string` | YES      | Passcode (4 - 8 digits)               |
| `email`     | `string` | Optional | Send passcode notification to eamil   |

### Schedule QRcode

```javascript
Skywatch.Lock.createSchudleQRcode(
  deviceIds,
  name,
  passcode,
  startTime,
  endTime,
  email,
);
```

| Property    | Type     | Required | Description                                             |
| ----------- | -------- | -------- | ------------------------------------------------------- |
| `deviceIds` | `array`  | YES      | Lock id list ex. `['59974', '59998']`                   |
| `name`      | `string` | YES      | passcode name                                           |
| `passcode`  | `string` | YES      | Passcode (4 - 8 digits)                                 |
| `startTime` | `string` | YES      | Passcode start time (Timestamp format ex. `1640577960`) |
| `entTime`   | `string` | YES      | Passcode end time (Timestamp format ex. `1640581560`)   |
| `email`     | `string` | Optional | Send passcode notification to eamil                     |

### Recurring QRcode

```javascript
Skywatch.Lock.createRecurringQRcode(
  deviceIds,
  name,
  passcode,
  startDate,
  endDate,
  startTime,
  endTime,
  week,
  timezone,
  email,
);
```

| Property    | Type     | Required | Description                                              |
| ----------- | -------- | -------- | -------------------------------------------------------- |
| `deviceIds` | `array`  | YES      | Lock id list ex. `['59974', '59998']`                    |
| `name`      | `string` | YES      | passcode name                                            |
| `passcode`  | `string` | YES      | Passcode (4 - 8 digits)                                  |
| `startDate` | `string` | YES      | Recurring start date (Timestamp format ex. `1642694400`) |
| `endDate`   | `string` | YES      | Recurring end date (Timestamp format ex. `1643558400`)   |
| `startTime` | `string` | YES      | seconds of start time ex. 8:00 -> `28800`                |
| `endTime`   | `string` | YES      | seconds of end time ex. 15:00 -> `54000`                 |
| `week`      | `string` | YES      | selected week list ex. Sun,Mon,Wed -> `013`              |
| `timezone`  | `string` | YES      | cuttent time ex. `8`                                     |
| `email`     | `string` | Optional | Send passcode notification to eamil                      |

### Delete QRcode

```javascript
Skywatch.Lock.deleteQRcode(sharingUid);
```

| Property     | Type     | Required | Description |
| ------------ | -------- | -------- | ----------- |
| `sharingUid` | `string` | YES      | QRcode id   |
