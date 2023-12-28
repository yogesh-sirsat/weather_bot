import React, { useEffect, useState } from "react";
import axios from "axios";
import type { User } from "../types";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const deleteUser = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.log(error);
      alert("Error while deleting user");
    }
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/users`)
      .then((response) => {
        console.log(response.data);
        setUsers(response.data);
      })
      .catch((error) => {
        console.log(error);
        alert("Error while fetching users");
      });
  }, []);

  // const handleBotTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setBotToken(event.target.value);
  // };

  return (
    <section className="shadow-xl p-4">
      <h1 className="text-xl font-bold mb-2">User Management</h1>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>City</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.city ? user.city : "Not selected"}</td>
              <td>
                <button
                  className="btn btn-error"
                  onClick={() => deleteUser(user.id)}
                  color="red"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default UserManagement;
