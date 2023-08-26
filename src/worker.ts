interface Env {
	ORDER: KVNamespace;
	COMMENT: KVNamespace;
}

async function router(request: Request, env: Env) {
	const { url, method } = request;
	const { pathname, searchParams } = new URL(url);
	switch (pathname) {
		case '/order':
			const upload = await request.json();
			const { id } = upload as any;
			await env.ORDER.put(id, JSON.stringify(upload));
			return new Response(JSON.stringify({ success: true }));
		case '/comment':
			switch (method) {
				case 'GET':
					const query_art = searchParams.get('art'),
						query_slug = searchParams.get('slug');
					const { keys } = await env.COMMENT.list({ prefix: `${query_art}#${query_slug}` });
					const result = [];
					for (const key of keys) {
						const value = await env.COMMENT.get(key.name);
						result.push(JSON.parse(value!));
					}
					return new Response(JSON.stringify(result));
				case 'PUT':
					const upload = await request.json();
					const { art, slug, id } = upload as any;
					await env.COMMENT.put(`${art}#${slug}#${id}`, JSON.stringify(upload));
					return new Response(JSON.stringify({ success: true }));
			}
	}
	return new Response('Not found', { status: 404 });
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const response = request.method === 'OPTIONS' ? new Response(null, { status: 204 }) : await router(request, env);
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.set('Access-Control-Allow-Headers', '*');
		response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
		response.headers.set('Access-Control-Max-Age', '86400');
		return response;
	},
};
