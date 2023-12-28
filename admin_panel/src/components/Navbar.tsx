import { Link } from "react-router-dom";
import type { Profile } from "../types";

interface NavbarProps {
  profile: Profile;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ profile, logout }) => {
  return (
    <div className="navbar min-w-screen bg-base-200 shadow-xl">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl md:text-2xl " to="/">
          WeatherBot Admin Panel
        </Link>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img alt="Tailwind CSS Navbar component" src={profile.picture} />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <p>{profile.name}</p>
            </li>
            <li>
              <p>{profile.email}</p>
            </li>
            <hr className="my-2"></hr>
            <li>
              <Link to={"/manage-bot"}>Manage Bot</Link>
            </li>
            <li>
              <a type="button" className="hover:bg-error hover:text-error-content" onClick={logout}>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
