import { useId, useState } from "react";

import { getFieldErrors } from "../../services/auth";
import { buttonClass } from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

/**
 * Edit form for the signed-in user's own profile.
 *
 * Deliberately limited to the three fields the backend's `updateUserSchema`
 * accepts: name, avatar and bio. `role`, `isActive` and `password` are not
 * editable here - the backend would strip them anyway (Zod drops unknown keys),
 * and offering them would be a lie about what the API supports.
 *
 * Client-side validation mirrors the backend's rules so obvious mistakes are
 * caught before a round trip; the backend stays the authority and its
 * field-level errors are merged in on top.
 */
const ProfileEditForm = ({ user, onSubmit, onCancel, isSaving = false }) => {
  const nameId = useId();
  const avatarId = useId();
  const bioId = useId();
  const nameErrorId = useId();
  const avatarErrorId = useId();
  const bioErrorId = useId();

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const validate = () => {
    const errors = {};
    const trimmedName = name.trim();
    const trimmedAvatar = avatar.trim();

    if (!trimmedName) {
      errors.name = "Name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (trimmedName.length > 100) {
      errors.name = "Name cannot exceed 100 characters.";
    }

    // The backend accepts either a valid URL or null. An empty box means
    // "remove my avatar", which is sent as null rather than "".
    if (trimmedAvatar) {
      try {
        const parsed = new URL(trimmedAvatar);

        if (!["http:", "https:"].includes(parsed.protocol)) {
          errors.avatar = "Avatar must be a valid http(s) URL.";
        }
      } catch {
        errors.avatar = "Avatar must be a valid URL.";
      }
    }

    if (bio.trim().length > 500) {
      errors.bio = "Bio cannot exceed 500 characters.";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const trimmedAvatar = avatar.trim();

    try {
      await onSubmit({
        name: name.trim(),
        bio: bio.trim(),
        // null clears the stored avatar; the schema explicitly allows it.
        avatar: trimmedAvatar ? trimmedAvatar : null,
      });
    } catch (requestError) {
      const backendFieldErrors = getFieldErrors(requestError);

      if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors(backendFieldErrors);
      } else {
        setFormError(requestError.message);
      }
    }
  };

  const fieldClass = (hasError) =>
    `mt-1.5 w-full rounded-lg border px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Edit profile</h2>

      <p className="mt-1 text-sm text-slate-600">
        Update how you appear across the forum. Email and account settings are
        not editable here.
      </p>

      <div className="mt-5">
        <label htmlFor={nameId} className="block text-sm font-medium text-slate-700">
          Name
        </label>

        <input
          id={nameId}
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (fieldErrors.name) {
              setFieldErrors((current) => ({ ...current, name: "" }));
            }
          }}
          maxLength={100}
          autoComplete="name"
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? nameErrorId : undefined}
          className={fieldClass(fieldErrors.name)}
        />

        {fieldErrors.name ? (
          <p id={nameErrorId} className="mt-1.5 text-sm text-red-700">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <label htmlFor={avatarId} className="block text-sm font-medium text-slate-700">
          Avatar URL <span className="font-normal text-slate-500">(optional)</span>
        </label>

        <input
          id={avatarId}
          type="url"
          value={avatar}
          onChange={(event) => {
            setAvatar(event.target.value);
            if (fieldErrors.avatar) {
              setFieldErrors((current) => ({ ...current, avatar: "" }));
            }
          }}
          placeholder="https://example.com/avatar.png"
          autoComplete="url"
          aria-invalid={Boolean(fieldErrors.avatar)}
          aria-describedby={fieldErrors.avatar ? avatarErrorId : undefined}
          className={fieldClass(fieldErrors.avatar)}
        />

        {fieldErrors.avatar ? (
          <p id={avatarErrorId} className="mt-1.5 text-sm text-red-700">
            {fieldErrors.avatar}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">
            Leave empty to remove your avatar.
          </p>
        )}
      </div>

      <div className="mt-4">
        <label htmlFor={bioId} className="block text-sm font-medium text-slate-700">
          Bio <span className="font-normal text-slate-500">(optional)</span>
        </label>

        <textarea
          id={bioId}
          value={bio}
          onChange={(event) => {
            setBio(event.target.value);
            if (fieldErrors.bio) {
              setFieldErrors((current) => ({ ...current, bio: "" }));
            }
          }}
          rows={4}
          maxLength={500}
          placeholder="Tell the community a little about yourself."
          aria-invalid={Boolean(fieldErrors.bio)}
          aria-describedby={fieldErrors.bio ? bioErrorId : undefined}
          className={`${fieldClass(fieldErrors.bio)} resize-y`}
        />

        <div className="mt-1.5 flex items-center justify-between">
          {fieldErrors.bio ? (
            <p id={bioErrorId} className="text-sm text-red-700">
              {fieldErrors.bio}
            </p>
          ) : (
            <span />
          )}

          <span className="text-xs text-slate-500">{bio.length}/500</span>
        </div>
      </div>

      {formError ? (
        <div className="mt-4">
          <ErrorMessage message={formError} />
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className={buttonClass("primary", "md")}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className={buttonClass("secondary", "md")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
