/**
 * Identity helpers.
 *
 * Mongoose serialises a document's primary key as **`_id`**. The `id` virtual is
 * NOT enabled on this project's schemas, so `doc.id` is `undefined` - and a
 * comparison like `reply.author._id === user.id` silently never matches. That
 * failure mode is invisible to the linter, so every id read goes through here.
 */

/** Read the id off a user, discussion, reply, category, or a raw id string. */
export const getId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;

  return value._id ?? value.id ?? null;
};

/** Two entities refer to the same document (string ids and populated docs alike). */
export const isSameId = (a, b) => {
  const left = getId(a);
  const right = getId(b);

  return Boolean(left) && Boolean(right) && String(left) === String(right);
};

/** True when the given user authored the item, or holds a moderation role. */
export const canManageItem = (item, user, { allowModerator = true } = {}) => {
  if (!user) return false;

  const authorId = getId(item?.author);

  if (authorId && isSameId(authorId, user)) return true;

  if (!allowModerator) return false;

  return user.role === "moderator" || user.role === "admin";
};
