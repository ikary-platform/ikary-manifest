# Display

Controls how a field value renders in list and detail views.
Each field definition can include a `display` block to override default rendering.

## Responsibilities

- Selects a visual renderer through the `type` property.
- Aligns cell content with the `align` property.
- Truncates long text values to a maximum character count.
- Passes format-specific options such as `currency`, `precision`, `statusMap`, and `badgeMap`.
- Supports injecting a custom component with `component` and `props`.

## Non-Goals

- Does not own field data types or validation rules. The field definition schema handles those.
- Does not define layout or column ordering. Page schemas control layout.

## Schema Surface

Defined in [`display.schema.yaml`](./display.schema.yaml).

## Validation Notes

| Field       | Type      | Required | Constraint / Notes                                                                                                                                                                       |
|-------------|-----------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`      | `enum`    | No       | `text`, `multiline-text`, `number`, `currency`, `percentage`, `date`, `datetime`, `boolean`, `status`, `badge`, `email`, `phone`, `url`, `entity-link`, `user`, `avatar-name`, `tags`, `progress`, `json-preview`, `actions`, `custom` |
| `align`     | `enum`    | No       | `left`, `center`, `right`                                                                                                                                                                |
| `truncate`  | `integer` | No       | Max character length before truncation                                                                                                                                                   |
| `tooltip`   | `boolean` | No       | Shows a tooltip on hover when `true`                                                                                                                                                     |
| `currency`  | `string`  | No       | ISO 4217 code, used with `type: currency`                                                                                                                                                |
| `precision` | `integer` | No       | Decimal places for numeric display types                                                                                                                                                 |
| `statusMap` | `object`  | No       | Maps status values to visual styles                                                                                                                                                      |
| `badgeMap`  | `object`  | No       | Maps badge values to visual styles                                                                                                                                                       |
| `format`    | `string`  | No       | Date/time format string                                                                                                                                                                  |
| `component` | `string`  | No       | Custom component name, used with `type: custom`                                                                                                                                          |
| `props`     | `object`  | No       | Arbitrary props forwarded to the custom component                                                                                                                                        |

## Example

```yaml
display:
  type: currency
  currency: USD
  precision: 2
  align: right
```
