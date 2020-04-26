export const apiRequest = async function (endpoint) {
	return await fetch('https://api.figma.com/v1' + endpoint, {
		method: 'GET',
		headers: { 'x-figma-token': '42909-59b7407f-9d5d-4efc-bbbe-1980e8e471a3' },
	})
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			return { err: error };
		});
};
