import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import users from "./UserData";

const Users = () => {
  const { user } = useAuth();

  const [userList, setUserList] = useState(() => {
    const savedUsers = localStorage.getItem("forumUsers");

    return savedUsers
      ? JSON.parse(savedUsers)
      : users;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator";

  useEffect(() => {
    localStorage.setItem(
      "forumUsers",
      JSON.stringify(userList),
    );
  }, [userList]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return userList;
    }

    return userList.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const username = item.username?.toLowerCase() || "";
      const email = item.email?.toLowerCase() || "";

      return (
        name.includes(search) ||
        username.includes(search) ||
        email.includes(search)
      );
    });
  }, [userList, searchTerm]);

  if (!isAdmin && !isModerator) {
    return (
      <section>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-800">
            Access denied
          </h1>

          <p className="mt-2 text-sm text-red-700">
            Only moderators and administrators can access the
            users directory.
          </p>
        </div>
      </section>
    );
  }

  const handleRoleChange = (userId, newRole) => {
    setUserList((currentUsers) =>
      currentUsers.map((item) =>
        String(item.id) === String(userId)
          ? {
              ...item,
              role: newRole,
            }
          : item,
      ),
    );

    const changedUser = userList.find(
      (item) => String(item.id) === String(userId),
    );

    if (changedUser) {
      setMessage(
        `${changedUser.name || changedUser.username}'s role was changed to ${newRole}.`,
      );
    }

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) {
      return;
    }

    if (
      userToDelete.username?.toLowerCase() ===
      user?.username?.toLowerCase()
    ) {
      setMessage("You cannot delete your own account.");
      setUserToDelete(null);
      return;
    }

    setUserList((currentUsers) =>
      currentUsers.filter(
        (item) =>
          String(item.id) !== String(userToDelete.id),
      ),
    );

    setMessage(
      `${userToDelete.name || userToDelete.username} was deleted successfully.`,
    );

    setUserToDelete(null);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <section>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Users
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Search and view community members.
          {isAdmin &&
            " As an administrator, you can also manage user accounts."}
        </p>
      </header>

      {message && (
        <div
          role="status"
          className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
        >
          {message}
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="user-search"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Search users
        </label>

        <input
          id="user-search"
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search by name, username, or email"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        />
      </div>

      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((item) => {
            const isCurrentUser =
              item.username?.toLowerCase() ===
              user?.username?.toLowerCase();

            return (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                      {item.profilePicture ? (
                        <img
                          src={item.profilePicture}
                          alt={`${item.name || item.username}'s profile`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (
                          item.name ||
                          item.username ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {item.name || item.username}
                      </h2>

                      <p className="text-sm text-slate-500">
                        @{item.username}
                      </p>

                      {item.email && (
                        <p className="mt-1 text-xs text-slate-500">
                          {item.email}
                        </p>
                      )}

                      <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                        {item.role || "user"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      to={`/profile/${item.username}`}
                      className="rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View profile
                    </Link>

                    {isAdmin && (
                      <>
                        <label
                          className="sr-only"
                          htmlFor={`role-${item.id}`}
                        >
                          Change role for {item.username}
                        </label>

                        <select
                          id={`role-${item.id}`}
                          value={item.role || "user"}
                          onChange={(event) =>
                            handleRoleChange(
                              item.id,
                              event.target.value,
                            )
                          }
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                        >
                          <option value="user">
                            User
                          </option>

                          <option value="moderator">
                            Moderator
                          </option>

                          <option value="admin">
                            Admin
                          </option>
                        </select>

                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() =>
                              setUserToDelete(item)
                            }
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">
              No users found.
            </p>
          </div>
        )}
      </div>

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <h2
              id="delete-user-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete user?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{" "}
              <strong>
                {userToDelete.name ||
                  userToDelete.username}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteUser}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete user
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Users;