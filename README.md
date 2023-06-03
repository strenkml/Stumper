# Stumper

A simple and small logger written in Typescript

## Installation

``` bash
npm install stumper
```

## Usage

### Configuration

```ts
import Stumper, { LOG_LEVEL } from "stumper";

Stumper.setConfig({logLevel: LOG_LEVEL.ALL});
```

| Parameter | Options | Default | Description |
| ------------- | ------------- | ------------- | ------------- |
| useColors | True/False | true | If the log should use colors. |
| useTimestamps | True/False | true | If the log should include timestamps. |
| timezone | Local/UTC | Local | The timezone that the log will use. Either your local time or UTC. Only matters if useTimestamps is true. |
| logLevel | Error/Warning/Info/All | Error | The level of logs to print to the logs. This value can be changed on the fly. |

```ts
Stumper.setLogLevel(LOG_LEVEL.WARNING);
Stumper.getLogLevel();
```

### Logging Methods

All logging methods take the same parameters.

| Parameter | Type | Required | Description |
| ------------- | ------------- | ------------- | ------------- |
| data | any | Yes | The log message to be sent. Objects and arrays will be stringified. |
| indentifier | string | No | Can be used to identify where in the code a log statement is coming from. For example the identifier could be set to the method name. |

Below are the 4 different logging methods and the colors that correspond with them.
| Method | Color |
| ------------- | ------------- |
| error | Red |
| warning | Yellow |
| info | Blue |
| debug | White |

**Examples**

```ts
Stumper.error("This is an error with an identifier", "main");
Stumper.error("This is an error without an identifier");

Stumper.warning("This is a warning");
Stumper.info("This is an info message");
Stumper.debug("This is a debug log message");

```
