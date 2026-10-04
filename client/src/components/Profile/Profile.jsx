import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [profilePicture, setProfilePicture] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState([]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfilePicture(user.profilePicture || "");
    setName(user.name || "");
    setUsername(user.username || "");
    setPronouns(user.pronouns || "");
    setGender(user.gender || "");
    setBio(user.bio || "");
    setLinks(user.links || []);
  }, [user]);

  /*
   * LOGGED-OUT PROFILE PAGE
   *
   * The Profile link is intentionally available to logged-out
   * users. When they open it, they are asked to either log in
   * or register.
   */
  if (!user) {
    return (
      <section className="mx-auto max-w-xl">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Your Profile
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            You need to log in or register before you can view
            and edit your profile.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Register
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /*
   * LOGGED-IN PROFILE
   */

  const displayName =
    user.name ||
    user.username ||
    user.email?.split("@")[0] ||
    "User";

  const handleAddLink = () => {
    setLinks([
      ...links,
      {
        label: "",
        url: "",
      },
    ]);
  };

  const handleRemoveLink = (indexToRemove) => {
    setLinks(
      links.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleLinkChange = (index, field, value) => {
    setLinks(
      links.map((link, linkIndex) =>
        linkIndex === index
          ? {
              ...link,
              [field]: value,
            }
          : link,
      ),
    );
  };

  const handleSave = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName || !trimmedUsername) {
      setError("Name and username are required.");
      setSuccess("");
      return;
    }

    const cleanedLinks = links
      .map((link) => ({
        label: link.label?.trim() || "",
        url: link.url?.trim() || "",
      }))
      .filter((link) => link.url);

    updateUser({
      profilePicture: profilePicture.trim(),
      name: trimmedName,
      username: trimmedUsername,
      pronouns: pronouns.trim(),
      gender: gender.trim(),
      bio: bio.trim(),
      links: cleanedLinks,
    });

    setIsEditing(false);
    setError("");
    setSuccess("Profile updated successfully.");

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const handleCancel = () => {
    setProfilePicture(user.profilePicture || "");
    setName(user.name || "");
    setUsername(user.username || "");
    setPronouns(user.pronouns || "");
    setGender(user.gender || "");
    setBio(user.bio || "");
    setLinks(user.links || []);

    setIsEditing(false);
    setError("");
  };

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          View and manage your profile information.
        </p>
      </header>

      {success && (
        <p
          role="status"
          className="mb-5 rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700"
        >
          {success}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}

      {!isEditing ? (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${displayName}'s profile`}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-3xl font-semibold text-slate-600"
                  aria-hidden="true"
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  @{user.username}
                </p>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  {user.bio || "No bio added yet."}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setSuccess("");
                  setError("");
                }}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Edit profile
              </button>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              About
            </h2>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm font-medium text-slate-500">
                  Name
                </dt>

                <dd className="mt-1 text-sm text-slate-900">
                  {user.name || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">
                  Username
                </dt>

                <dd className="mt-1 text-sm text-slate-900">
                  @{user.username}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">
                  Pronouns
                </dt>

                <dd className="mt-1 text-sm text-slate-900">
                  {user.pronouns || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">
                  Gender
                </dt>

                <dd className="mt-1 text-sm text-slate-900">
                  {user.gender || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">
                  Bio
                </dt>

                <dd className="mt-1 text-sm leading-6 text-slate-700">
                  {user.bio || "No bio added yet."}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              External Links
            </h2>

            {user.links?.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {user.links.map((link, index) => (
                  <li key={`${link.url}-${index}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-slate-700 hover:underline"
                    >
                      {link.label || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No external links added yet.
              </p>
            )}
          </section>
        </>
      ) : (
        <form
          onSubmit={handleSave}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="profile-picture"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Profile picture URL
              </label>

              <input
                id="profile-picture"
                type="url"
                value={profilePicture}
                onChange={(event) =>
                  setProfilePicture(event.target.value)
                }
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="profile-username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Username
              </label>

              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="profile-pronouns"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Pronouns
              </label>

              <input
                id="profile-pronouns"
                type="text"
                value={pronouns}
                onChange={(event) =>
                  setPronouns(event.target.value)
                }
                placeholder="e.g. she/her"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="profile-gender"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Gender
              </label>

              <input
                id="profile-gender"
                type="text"
                value={gender}
                onChange={(event) =>
                  setGender(event.target.value)
                }
                placeholder="Optional"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="profile-bio"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Bio
              </label>

              <textarea
                id="profile-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={5}
                placeholder="Tell the community about yourself..."
                className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    External links
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add links to your other websites or apps.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddLink}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add link
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`link-label-${index}`}
                          className="mb-2 block text-xs font-medium text-slate-600"
                        >
                          Label
                        </label>

                        <input
                          id={`link-label-${index}`}
                          type="text"
                          value={link.label}
                          onChange={(event) =>
                            handleLinkChange(
                              index,
                              "label",
                              event.target.value,
                            )
                          }
                          placeholder="Instagram"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`link-url-${index}`}
                          className="mb-2 block text-xs font-medium text-slate-600"
                        >
                          URL
                        </label>

                        <input
                          id={`link-url-${index}`}
                          type="url"
                          value={link.url}
                          onChange={(event) =>
                            handleLinkChange(
                              index,
                              "url",
                              event.target.value,
                            )
                          }
                          placeholder="https://instagram.com/username"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="mt-3 text-sm font-medium text-red-600 hover:underline"
                    >
                      Remove link
                    </button>
                  </div>
                ))}

                {links.length === 0 && (
                  <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No external links added.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save changes
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default Profile;