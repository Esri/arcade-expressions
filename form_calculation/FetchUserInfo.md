# Fetch user's name or email address

When performing inspections or collecting new data, editor tracking works great for storing the username of the person who created or edited the feature, but it doesn’t store the user’s full name or email address. Having these extra attributes can make it much easier to understand the data when displayed in reports, maps, and dashboards. This can be accomplished by getting the signed in user’s info via Arcade.

## Examples

I’m filling out a damage inspection report and need to provide my name.

```js
GetUser($layer).fullName
```

I’m filling out a damage inspection report and need to provide my email address.

```js
GetUser($layer).email
```