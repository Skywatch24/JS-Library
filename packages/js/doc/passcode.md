# Passcode Access

### Passcode List

```javascript
Skywatch.Lock.getPasscodeList(deviceId);
```

| Property   | Type     | Required | Description |
| ---------- | -------- | -------- | ----------- |
| `deviceId` | `string` | YES      | Sensor id   |

#### Example Output:

```json
[
  {
    "code": "46260013",
    "alias": "#46260013",
    "id": "8c69af",
    "status": "success",
    "timestamp": 1638160855,
    "email_address": ""
  },
  {
    "alias": "Testttt",
    "code": "59023310",
    "recurring": "1638374400-1641139199:0-36000:56",
    "origin_recurring": "1638374400-1641139199:28800-64800:56",
    "endless": "false",
    "id": "d55956",
    "status": "not_yet",
    "timestamp": 1638411380,
    "email_address": ""
  },
  {
    "alias": "ScheduleTest",
    "code": "21933305",
    "schedule": "1640577960-1640581560",
    "id": "f0df4c",
    "status": "not_yet",
    "timestamp": 1640577960,
    "email_address": ""
  }
]
```

### Always Passcode

```javascript
Skywatch.Lock.createAlwaysPasscode(deviceId, name, passcode, email);
```

| Property   | Type     | Required | Description                         |
| ---------- | -------- | -------- | ----------------------------------- |
| `deviceId` | `string` | YES      | Sensor id                           |
| `name`     | `string` | YES      | passcode name                       |
| `passcode` | `string` | YES      | Passcode (4 - 8 digits)             |
| `email`    | `string` | Optional | Send passcode notification to eamil |

### Onetime Passcode

```javascript
Skywatch.Lock.createOnetimePasscode(deviceId, name, passcode, email);
```

| Property   | Type     | Required | Description                         |
| ---------- | -------- | -------- | ----------------------------------- |
| `deviceId` | `string` | YES      | Sensor id                           |
| `name`     | `string` | YES      | passcode name                       |
| `passcode` | `string` | YES      | Passcode (4 - 8 digits)             |
| `email`    | `string` | Optional | Send passcode notification to eamil |

### Schedule Passcode

```javascript
Skywatch.Lock.createSchudlePasscode(
  deviceId,
  name,
  passcode,
  startTime,
  endTime,
  email,
);
```

| Property    | Type     | Required | Description                                             |
| ----------- | -------- | -------- | ------------------------------------------------------- |
| `deviceId`  | `string` | YES      | Sensor id                                               |
| `name`      | `string` | YES      | passcode name                                           |
| `passcode`  | `string` | YES      | Passcode (4 - 8 digits)                                 |
| `startTime` | `string` | YES      | Passcode start time (Timestamp format ex. `1640577960`) |
| `entTime`   | `string` | YES      | Passcode end time (Timestamp format ex. `1640581560`)   |
| `email`     | `string` | Optional | Send passcode notification to eamil                     |

### Recurring Passcode

```javascript
Skywatch.Lock.createRecurringPasscode(
  deviceId,
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
| `deviceId`  | `string` | YES      | Sensor id                                                |
| `name`      | `string` | YES      | passcode name                                            |
| `passcode`  | `string` | YES      | Passcode (4 - 8 digits)                                  |
| `startDate` | `string` | YES      | Recurring start date (Timestamp format ex. `1642694400`) |
| `endDate`   | `string` | YES      | Recurring end date (Timestamp format ex. `1643558400`)   |
| `startTime` | `string` | YES      | seconds of start time ex. 8:00 -> `28800`                |
| `endTime`   | `string` | YES      | seconds of end time ex. 15:00 -> `54000`                 |
| `week`      | `string` | YES      | selected week list ex. Sun,Mon,Wed -> `013`              |
| `timezone`  | `string` | YES      | cuttent time ex. `8`                                     |
| `email`     | `string` | Optional | Send passcode notification to eamil                      |

### Delete Passcode

```javascript
Skywatch.Lock.deletePasscode(deviceId, passcodeId, passcode);
```

| Property     | Type     | Required | Description             |
| ------------ | -------- | -------- | ----------------------- |
| `deviceId`   | `string` | YES      | Sensor id               |
| `passcodeId` | `string` | YES      | Passcode id             |
| `passcode`   | `string` | YES      | Passcode (4 - 8 digits) |
