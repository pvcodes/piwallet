import axios from "axios";

export function setupAxiosInterceptors(jwt_token: string) {
	axios.interceptors.request.clear();
	axios.interceptors.request.use(
		(config) => {
			config.headers["Authorization"] = `Bearer ${jwt_token}`;
			config.headers["Content-Type"] = "application/json";
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);
}
