import axios from "axios";
import { useEffect, useState } from "react";

const Bot: React.FC = () => {
  const [botConfig, setBotConfig] = useState({
    weatherApiKey: "",
  });
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/bot-config`)
      .then((response) => {
        console.log(response.data);
        setBotConfig({
          ...botConfig,
          weatherApiKey: response.data.apiKey,
        });
      })
      .catch((error) => {
        console.log(error);
        alert("Error while fetching bot configuration");
      });
  }, []);

  const updateWeatherApiKey = async (weatherApiKey: string) => {
    if (!weatherApiKey) {
      alert("Please enter a valid weather API key");
      return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/weather/api-key`, {
        apiKey: weatherApiKey,
      });
      alert("Weather API key updated successfully");
    } catch (error) {
      console.log(error);
      alert("Error while updating bot configuration");
    }
  };

  return (
    <section className="shadow-xl p-4">
      <h1 className="text-xl font-bold mb-2">Bot Management</h1>
      <label className="form-control w-full max-w-xs md:max-w-md flex flex-col gap-2">
        <div className="label">
          <span className="label-text">Weather API key</span>
        </div>
        <input
          type="text"
          placeholder="Enter weather API key"
          className="input input-bordered w-full max-w-xs md:max-w-md"
          value={botConfig.weatherApiKey || ""}
          onChange={(e) =>
            setBotConfig({ ...botConfig, weatherApiKey: e.target.value })
          }
        />
        <button
          className="btn btn-primary w-full max-w-xs md:max-w-md"
          onClick={() => {
            updateWeatherApiKey(botConfig.weatherApiKey);
          }}
        >
          Update Weather API key
        </button>
      </label>
    </section>
  );
};

export default Bot;
