(function (l, r) {
	if (l.getElementById('livereloadscript')) return;
	r = l.createElement('script');
	r.async = 1;
	r.src =
		'//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1';
	r.id = 'livereloadscript';
	l.getElementsByTagName('head')[0].appendChild(r);
})(window.document);
var app = (function () {
	'use strict';

	function noop() {}
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char },
		};
	}
	function run(fn) {
		return fn();
	}
	function blank_object() {
		return Object.create(null);
	}
	function run_all(fns) {
		fns.forEach(run);
	}
	function is_function(thing) {
		return typeof thing === 'function';
	}
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}
	function not_equal(a, b) {
		return a != a ? b == b : a !== b;
	}
	function validate_store(store, name) {
		if (store != null && typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}
	function subscribe(store, ...callbacks) {
		if (store == null) {
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}
	function null_to_empty(value) {
		return value == null ? '' : value;
	}

	function append(target, node) {
		target.appendChild(node);
	}
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}
	function detach(node) {
		node.parentNode.removeChild(node);
	}
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}
	function element(name) {
		return document.createElement(name);
	}
	function text(data) {
		return document.createTextNode(data);
	}
	function space() {
		return text(' ');
	}
	function empty() {
		return text('');
	}
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}
	function children(element) {
		return Array.from(element.childNodes);
	}
	function set_style(node, key, value, important) {
		node.style.setProperty(key, value, important ? 'important' : '');
	}
	function custom_event(type, detail) {
		const e = document.createEvent('CustomEvent');
		e.initCustomEvent(type, false, false, detail);
		return e;
	}
	class HtmlTag {
		constructor(html, anchor = null) {
			this.e = element('div');
			this.a = anchor;
			this.u(html);
		}
		m(target, anchor = null) {
			for (let i = 0; i < this.n.length; i += 1) {
				insert(target, this.n[i], anchor);
			}
			this.t = target;
		}
		u(html) {
			this.e.innerHTML = html;
			this.n = Array.from(this.e.childNodes);
		}
		p(html) {
			this.d();
			this.u(html);
			this.m(this.t, this.a);
		}
		d() {
			this.n.forEach(detach);
		}
	}

	let current_component;
	function set_current_component(component) {
		current_component = component;
	}
	function get_current_component() {
		if (!current_component) throw new Error(`Function called outside component initialization`);
		return current_component;
	}
	function beforeUpdate(fn) {
		get_current_component().$$.before_update.push(fn);
	}
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(type, detail);
				callbacks.slice().forEach((fn) => {
					fn.call(component, event);
				});
			}
		};
	}
	// TODO figure out if we still want to support
	// shorthand events, or if we want to implement
	// a real bubbling mechanism
	function bubble(component, event) {
		const callbacks = component.$$.callbacks[event.type];
		if (callbacks) {
			callbacks.slice().forEach((fn) => fn(event));
		}
	}

	const dirty_components = [];
	const binding_callbacks = [];
	const render_callbacks = [];
	const flush_callbacks = [];
	const resolved_promise = Promise.resolve();
	let update_scheduled = false;
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}
	function tick() {
		schedule_update();
		return resolved_promise;
	}
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}
	let flushing = false;
	const seen_callbacks = new Set();
	function flush() {
		if (flushing) return;
		flushing = true;
		do {
			// first, call beforeUpdate functions
			// and update components
			for (let i = 0; i < dirty_components.length; i += 1) {
				const component = dirty_components[i];
				set_current_component(component);
				update(component.$$);
			}
			dirty_components.length = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		flushing = false;
		seen_callbacks.clear();
	}
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}
	const outroing = new Set();
	let outros;
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros, // parent group
		};
	}
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		}
	}

	const globals = typeof window !== 'undefined' ? window : global;
	function create_component(block) {
		block && block.c();
	}
	function mount_component(component, target, anchor) {
		const { fragment, on_mount, on_destroy, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = on_mount.map(run).filter(is_function);
			if (on_destroy) {
				on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}
	function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
		const parent_component = current_component;
		set_current_component(component);
		const prop_values = options.props || {};
		const $$ = (component.$$ = {
			fragment: null,
			ctx: null,
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			before_update: [],
			after_update: [],
			context: new Map(parent_component ? parent_component.$$.context : []),
			// everything else
			callbacks: blank_object(),
			dirty,
		});
		let ready = false;
		$$.ctx = instance
			? instance(component, prop_values, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if ($$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				const nodes = children(options.target);
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}
	class SvelteComponent {
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}
		$on(type, callback) {
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}
		$set() {
			// overridden by instance, if it has props
		}
	}

	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
	}
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}
	function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}
	function validate_each_argument(arg) {
		if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
			let msg = '{#each} only iterates over array-like objects.';
			if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
				msg += ' You can use a spread to convert this iterable into an array.';
			}
			throw new Error(msg);
		}
	}
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}
	class SvelteComponentDev extends SvelteComponent {
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error(`'target' is a required option`);
			}
			super();
		}
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn(`Component was already destroyed`); // eslint-disable-line no-console
			};
		}
		$capture_state() {}
		$inject_state() {}
	}

	const subscriber_queue = [];
	/**
	 * Creates a `Readable` store that allows reading by subscription.
	 * @param value initial value
	 * @param {StartStopNotifier}start start and stop notifications for subscriptions
	 */
	function readable(value, start) {
		return {
			subscribe: writable(value, start).subscribe,
		};
	}
	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 * @param {*=}value initial value
	 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
	 */
	function writable(value, start = noop) {
		let stop;
		const subscribers = [];
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (let i = 0; i < subscribers.length; i += 1) {
						const s = subscribers[i];
						s[1]();
						subscriber_queue.push(s, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}
		function update(fn) {
			set(fn(value));
		}
		function subscribe(run, invalidate = noop) {
			const subscriber = [run, invalidate];
			subscribers.push(subscriber);
			if (subscribers.length === 1) {
				stop = start(set) || noop;
			}
			run(value);
			return () => {
				const index = subscribers.indexOf(subscriber);
				if (index !== -1) {
					subscribers.splice(index, 1);
				}
				if (subscribers.length === 0) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}
	function derived(stores, fn, initial_value) {
		const single = !Array.isArray(stores);
		const stores_array = single ? [stores] : stores;
		const auto = fn.length < 2;
		return readable(initial_value, (set) => {
			let inited = false;
			const values = [];
			let pending = 0;
			let cleanup = noop;
			const sync = () => {
				if (pending) {
					return;
				}
				cleanup();
				const result = fn(single ? values[0] : values, set);
				if (auto) {
					set(result);
				} else {
					cleanup = is_function(result) ? result : noop;
				}
			};
			const unsubscribers = stores_array.map((store, i) =>
				subscribe(
					store,
					(value) => {
						values[i] = value;
						pending &= ~(1 << i);
						if (inited) {
							sync();
						}
					},
					() => {
						pending |= 1 << i;
					}
				)
			);
			inited = true;
			sync();
			return function stop() {
				run_all(unsubscribers);
				cleanup();
			};
		});
	}

	function regexparam(str, loose) {
		if (str instanceof RegExp) return { keys: false, pattern: str };
		var c,
			o,
			tmp,
			ext,
			keys = [],
			pattern = '',
			arr = str.split('/');
		arr[0] || arr.shift();

		while ((tmp = arr.shift())) {
			c = tmp[0];
			if (c === '*') {
				keys.push('wild');
				pattern += '/(.*)';
			} else if (c === ':') {
				o = tmp.indexOf('?', 1);
				ext = tmp.indexOf('.', 1);
				keys.push(tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length));
				pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
				if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
			} else {
				pattern += '/' + tmp;
			}
		}

		return {
			keys: keys,
			pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i'),
		};
	}

	/* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.20.1 */

	const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

	// (219:0) {:else}
	function create_else_block(ctx) {
		let switch_instance_anchor;
		let current;
		var switch_value = /*component*/ ctx[0];

		function switch_props(ctx) {
			return { $$inline: true };
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props());
			switch_instance.$on('routeEvent', /*routeEvent_handler_1*/ ctx[10]);
		}

		const block = {
			c: function create() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (switch_instance) {
					mount_component(switch_instance, target, anchor);
				}

				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (switch_value !== (switch_value = /*component*/ ctx[0])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						switch_instance.$on('routeEvent', /*routeEvent_handler_1*/ ctx[10]);
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(
							switch_instance,
							switch_instance_anchor.parentNode,
							switch_instance_anchor
						);
					} else {
						switch_instance = null;
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(switch_instance_anchor);
				if (switch_instance) destroy_component(switch_instance, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_else_block.name,
			type: 'else',
			source: '(219:0) {:else}',
			ctx,
		});

		return block;
	}

	// (217:0) {#if componentParams}
	function create_if_block(ctx) {
		let switch_instance_anchor;
		let current;
		var switch_value = /*component*/ ctx[0];

		function switch_props(ctx) {
			return {
				props: { params: /*componentParams*/ ctx[1] },
				$$inline: true,
			};
		}

		if (switch_value) {
			var switch_instance = new switch_value(switch_props(ctx));
			switch_instance.$on('routeEvent', /*routeEvent_handler*/ ctx[9]);
		}

		const block = {
			c: function create() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (switch_instance) {
					mount_component(switch_instance, target, anchor);
				}

				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const switch_instance_changes = {};
				if (dirty & /*componentParams*/ 2)
					switch_instance_changes.params = /*componentParams*/ ctx[1];

				if (switch_value !== (switch_value = /*component*/ ctx[0])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));
						switch_instance.$on('routeEvent', /*routeEvent_handler*/ ctx[9]);
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(
							switch_instance,
							switch_instance_anchor.parentNode,
							switch_instance_anchor
						);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					switch_instance.$set(switch_instance_changes);
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(switch_instance_anchor);
				if (switch_instance) destroy_component(switch_instance, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block.name,
			type: 'if',
			source: '(217:0) {#if componentParams}',
			ctx,
		});

		return block;
	}

	function create_fragment(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*componentParams*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](
			ctx
		);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error_1(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option'
				);
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[
							current_block_type_index
						](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function wrap(route, userData, ...conditions) {
		// Check if we don't have userData
		if (userData && typeof userData == 'function') {
			conditions = conditions && conditions.length ? conditions : [];
			conditions.unshift(userData);
			userData = undefined;
		}

		// Parameter route and each item of conditions must be functions
		if (!route || typeof route != 'function') {
			throw Error('Invalid parameter route');
		}

		if (conditions && conditions.length) {
			for (let i = 0; i < conditions.length; i++) {
				if (!conditions[i] || typeof conditions[i] != 'function') {
					throw Error('Invalid parameter conditions[' + i + ']');
				}
			}
		}

		// Returns an object that contains all the functions to execute too
		const obj = { route, userData };

		if (conditions && conditions.length) {
			obj.conditions = conditions;
		}

		// The _sveltesparouter flag is to confirm the object was created by this router
		Object.defineProperty(obj, '_sveltesparouter', { value: true });

		return obj;
	}

	/**
	 * @typedef {Object} Location
	 * @property {string} location - Location (page/view), for example `/book`
	 * @property {string} [querystring] - Querystring from the hash, as a string not parsed
	 */
	/**
	 * Returns the current location from the hash.
	 *
	 * @returns {Location} Location object
	 * @private
	 */
	function getLocation() {
		const hashPosition = window.location.href.indexOf('#/');

		let location = hashPosition > -1 ? window.location.href.substr(hashPosition + 1) : '/';

		// Check if there's a querystring
		const qsPosition = location.indexOf('?');

		let querystring = '';

		if (qsPosition > -1) {
			querystring = location.substr(qsPosition + 1);
			location = location.substr(0, qsPosition);
		}

		return { location, querystring };
	}

	const loc = readable(
		null, // eslint-disable-next-line prefer-arrow-callback
		function start(set) {
			set(getLocation());

			const update = () => {
				set(getLocation());
			};

			window.addEventListener('hashchange', update, false);

			return function stop() {
				window.removeEventListener('hashchange', update, false);
			};
		}
	);

	const location = derived(loc, ($loc) => $loc.location);
	const querystring = derived(loc, ($loc) => $loc.querystring);

	function push(location) {
		if (
			!location ||
			location.length < 1 ||
			(location.charAt(0) != '/' && location.indexOf('#/') !== 0)
		) {
			throw Error('Invalid parameter location');
		}

		// Execute this code when the current call stack is complete
		return tick().then(() => {
			window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
		});
	}

	function pop() {
		// Execute this code when the current call stack is complete
		return tick().then(() => {
			window.history.back();
		});
	}

	function replace(location) {
		if (
			!location ||
			location.length < 1 ||
			(location.charAt(0) != '/' && location.indexOf('#/') !== 0)
		) {
			throw Error('Invalid parameter location');
		}

		// Execute this code when the current call stack is complete
		return tick().then(() => {
			const dest = (location.charAt(0) == '#' ? '' : '#') + location;

			try {
				window.history.replaceState(undefined, undefined, dest);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn(
					"Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment."
				);
			}

			// The method above doesn't trigger the hashchange event, so let's do that manually
			window.dispatchEvent(new Event('hashchange'));
		});
	}

	function link(node, hrefVar) {
		// Only apply to <a> tags
		if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
			throw Error('Action "link" can only be used with <a> tags');
		}

		updateLink(node, hrefVar || node.getAttribute('href'));

		return {
			update(updated) {
				updateLink(node, updated);
			},
		};
	}

	// Internal function used by the link function
	function updateLink(node, href) {
		// Destination must start with '/'
		if (!href || href.length < 1 || href.charAt(0) != '/') {
			throw Error('Invalid value for "href" attribute');
		}

		// Add # to the href attribute
		node.setAttribute('href', '#' + href);
	}

	function nextTickPromise(cb) {
		// eslint-disable-next-line no-console
		console.warn(
			"nextTickPromise from 'svelte-spa-router' is deprecated and will be removed in version 3; use the 'tick' method from the Svelte runtime instead"
		);

		return tick().then(cb);
	}

	function instance($$self, $$props, $$invalidate) {
		let $loc,
			$$unsubscribe_loc = noop;

		validate_store(loc, 'loc');
		component_subscribe($$self, loc, ($$value) => $$invalidate(4, ($loc = $$value)));
		$$self.$$.on_destroy.push(() => $$unsubscribe_loc());
		let { routes = {} } = $$props;
		let { prefix = '' } = $$props;

		/**
		 * Container for a route: path, component
		 */
		class RouteItem {
			/**
			 * Initializes the object and creates a regular expression from the path, using regexparam.
			 *
			 * @param {string} path - Path to the route (must start with '/' or '*')
			 * @param {SvelteComponent} component - Svelte component for the route
			 */
			constructor(path, component) {
				if (
					!component ||
					(typeof component != 'function' &&
						(typeof component != 'object' || component._sveltesparouter !== true))
				) {
					throw Error('Invalid component object');
				}

				// Path must be a regular or expression, or a string starting with '/' or '*'
				if (
					!path ||
					(typeof path == 'string' &&
						(path.length < 1 || (path.charAt(0) != '/' && path.charAt(0) != '*'))) ||
					(typeof path == 'object' && !(path instanceof RegExp))
				) {
					throw Error('Invalid value for "path" argument');
				}

				const { pattern, keys } = regexparam(path);
				this.path = path;

				// Check if the component is wrapped and we have conditions
				if (typeof component == 'object' && component._sveltesparouter === true) {
					this.component = component.route;
					this.conditions = component.conditions || [];
					this.userData = component.userData;
				} else {
					this.component = component;
					this.conditions = [];
					this.userData = undefined;
				}

				this._pattern = pattern;
				this._keys = keys;
			}

			/**
			 * Checks if `path` matches the current route.
			 * If there's a match, will return the list of parameters from the URL (if any).
			 * In case of no match, the method will return `null`.
			 *
			 * @param {string} path - Path to test
			 * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
			 */
			match(path) {
				// If there's a prefix, remove it before we run the matching
				if (prefix && path.startsWith(prefix)) {
					path = path.substr(prefix.length) || '/';
				}

				// Check if the pattern matches
				const matches = this._pattern.exec(path);

				if (matches === null) {
					return null;
				}

				// If the input was a regular expression, this._keys would be false, so return matches as is
				if (this._keys === false) {
					return matches;
				}

				const out = {};
				let i = 0;

				while (i < this._keys.length) {
					out[this._keys[i]] = matches[++i] || null;
				}

				return out;
			}

			/**
			 * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoaded` and `conditionsFailed` events
			 * @typedef {Object} RouteDetail
			 * @property {SvelteComponent} component - Svelte component
			 * @property {string} name - Name of the Svelte component
			 * @property {string} location - Location path
			 * @property {string} querystring - Querystring from the hash
			 * @property {Object} [userData] - Custom data passed by the user
			 */
			/**
			 * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
			 *
			 * @param {RouteDetail} detail - Route detail
			 * @returns {bool} Returns true if all the conditions succeeded
			 */
			checkConditions(detail) {
				for (let i = 0; i < this.conditions.length; i++) {
					if (!this.conditions[i](detail)) {
						return false;
					}
				}

				return true;
			}
		}

		// Set up all routes
		const routesList = [];

		if (routes instanceof Map) {
			// If it's a map, iterate on it right away
			routes.forEach((route, path) => {
				routesList.push(new RouteItem(path, route));
			});
		} else {
			// We have an object, so iterate on its own properties
			Object.keys(routes).forEach((path) => {
				routesList.push(new RouteItem(path, routes[path]));
			});
		}

		// Props for the component to render
		let component = null;

		let componentParams = null;

		// Event dispatcher from Svelte
		const dispatch = createEventDispatcher();

		// Just like dispatch, but executes on the next iteration of the event loop
		const dispatchNextTick = (name, detail) => {
			// Execute this code when the current call stack is complete
			tick().then(() => {
				dispatch(name, detail);
			});
		};

		const writable_props = ['routes', 'prefix'];

		Object_1.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$')
				console_1.warn(`<Router> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots('Router', $$slots, []);

		function routeEvent_handler(event) {
			bubble($$self, event);
		}

		function routeEvent_handler_1(event) {
			bubble($$self, event);
		}

		$$self.$set = ($$props) => {
			if ('routes' in $$props) $$invalidate(2, (routes = $$props.routes));
			if ('prefix' in $$props) $$invalidate(3, (prefix = $$props.prefix));
		};

		$$self.$capture_state = () => ({
			readable,
			derived,
			tick,
			wrap,
			getLocation,
			loc,
			location,
			querystring,
			push,
			pop,
			replace,
			link,
			updateLink,
			nextTickPromise,
			createEventDispatcher,
			regexparam,
			routes,
			prefix,
			RouteItem,
			routesList,
			component,
			componentParams,
			dispatch,
			dispatchNextTick,
			$loc,
		});

		$$self.$inject_state = ($$props) => {
			if ('routes' in $$props) $$invalidate(2, (routes = $$props.routes));
			if ('prefix' in $$props) $$invalidate(3, (prefix = $$props.prefix));
			if ('component' in $$props) $$invalidate(0, (component = $$props.component));
			if ('componentParams' in $$props)
				$$invalidate(1, (componentParams = $$props.componentParams));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*component, $loc*/ 17) {
				// Handle hash change events
				// Listen to changes in the $loc store and update the page
				{
					// Find a route matching the location
					$$invalidate(0, (component = null));

					let i = 0;

					while (!component && i < routesList.length) {
						const match = routesList[i].match($loc.location);

						if (match) {
							const detail = {
								component: routesList[i].component,
								name: routesList[i].component.name,
								location: $loc.location,
								querystring: $loc.querystring,
								userData: routesList[i].userData,
							};

							// Check if the route can be loaded - if all conditions succeed
							if (!routesList[i].checkConditions(detail)) {
								// Trigger an event to notify the user
								dispatchNextTick('conditionsFailed', detail);

								break;
							}

							$$invalidate(0, (component = routesList[i].component));

							// Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
							// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
							if (match && typeof match == 'object' && Object.keys(match).length) {
								$$invalidate(1, (componentParams = match));
							} else {
								$$invalidate(1, (componentParams = null));
							}

							dispatchNextTick('routeLoaded', detail);
						}

						i++;
					}
				}
			}
		};

		return [
			component,
			componentParams,
			routes,
			prefix,
			$loc,
			RouteItem,
			routesList,
			dispatch,
			dispatchNextTick,
			routeEvent_handler,
			routeEvent_handler_1,
		];
	}

	class Router extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, { routes: 2, prefix: 3 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Router',
				options,
				id: create_fragment.name,
			});
		}

		get routes() {
			throw new Error_1(
				"<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set routes(value) {
			throw new Error_1(
				"<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get prefix() {
			throw new Error_1(
				"<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set prefix(value) {
			throw new Error_1(
				"<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}
	}

	const figmaProject = [
		{
			name: 'Hello',
			stories: [
				'<section class="frame" style="overflow: hidden; background-image: url(./images/!intro); background-size: cover;  width:100%; height:100%; display:block;" ><div id="495:31" style="transform: matrix(0.9836799502372742,-0.17992709577083588,0.17992709577083588,0.9836799502372742,0,0); transform-origin: 0% 0%; position: absolute; left: 40.658447265625px; bottom: 117.63330078125px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="495:32" style="position: static; left: calc(50% - 92px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">You can also use arrow keys.</span></div></div><div id="578:25" style="transform: matrix(0.973799467086792,0.2274085283279419,-0.2274085283279419,0.973799467086792,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 133.6175994873047px - -57.62358093261719px); top: calc(50% - 22px - -33px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I578:25;495:30" style="width: 255.23519897460938px; position: static; left: calc(50% - 127.61759948730469px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">It works like instagram stories. Tap left or right, and swipe to skip chapters.</span></div></div><div id="579:44" style="transform: matrix(0.9876883625984192,-0.15643446147441864,0.15643446147441864,0.9876883625984192,0,0); transform-origin: 0% 0%; width: 348.8829345703125px; position: absolute; left: calc(50% - 174.44146728515625px - 6.55853271484375px); top: 106.57731628417969px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I579:44;495:30" style="width: 336.8829345703125px; position: static; left: calc(50% - 168.44146728515625px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Hi, I’m Barron. Welcome to my website :)</span></div></div></section>',
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(246, 207, 178, 1) 100%);  width:100%; height:100%; display:block;" ><div id="544:1" style="transform: matrix(0.9964331984519958,-0.08438510447740555,0.08438510447740555,0.9964331984519958,0,0); transform-origin: 0% 0%; width: 327.478515625px; position: absolute; left: calc(50% - 163.7392578125px - 19.575170516967773px); height: 271.1796875px; top: 270.49700927734375px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; overflow: hidden; "><div id="294:0" style="width: 327.478515625px; position: static; right: 0px; height: 247.1796875px; top: 0px; flex: none; align-self: stretch; flex-grow: 1; margin-bottom: 6px; background-image: url(./images/no_spaces); background-size: cover; box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "></div><div id="544:0" style="position: static; right: 177.478515625px; height: 18px; top: 253.1796875px; flex: none; flex-grow: 0; opacity: 0.699999988079071; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">FIG 1. me and software</span></div></div><div id="543:55" style="transform: matrix(0.9909805655479431,0.13400520384311676,-0.13400520384311676,0.9909805655479431,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 168px - -1.6786079406738281px); top: 70px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="593:0" style="position: static; right: 0px; top: calc(50% - 22px - 36.5px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 11px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I593:0;578:15" style="position: static; left: calc(50% - 162px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">I mostly design software.</span></div></div><div id="601:0" style="width: 218.92893981933594px; position: static; left: calc(50% - 109.46446990966797px - 58.535543286126085px); top: calc(50% - 31px - -27.50000762939453px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I601:0;495:30" style="width: 206.92893981933594px; position: static; left: calc(50% - 103.46446990966797px - 0px); height: 54px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Primarily zero-to-one launches for new services, focusing on emerging technology.</span></div></div></div><div id="1208:43" style="transform: matrix(0.9909805655479431,0.13400520384311676,-0.13400520384311676,0.9909805655479431,0,0); transform-origin: 0% 0%; width: 193.85501098632812px; position: absolute; right: 23.248764038085938px; bottom: 139px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:43;495:30" style="width: 181.85501098632812px; position: static; left: calc(50% - 90.92750549316406px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Sometimes I even write the software. Like this website!</span></div></div></section>',
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(246, 207, 178, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1208:16" style="transform: matrix(0.9905165433883667,0.13739357888698578,-0.13739357888698578,0.9905165433883667,0,0); transform-origin: 0% 0%; width: 344.1189880371094px; position: absolute; left: calc(50% - 172.0594940185547px - -18.910274505615234px); height: 253.6565399169922px; top: 208px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="1208:17" style="width: 344.1189880371094px; position: static; left: 0px; height: 229.6565399169922px; top: 0px; flex: none; align-self: stretch; flex-grow: 1; margin-bottom: 6px; background-image: url(./images/cl_view_1); background-size: cover; box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "></div><div id="1208:18" style="position: static; right: 198.11898803710938px; height: 18px; top: 235.6565399169922px; flex: none; flex-grow: 0; opacity: 0.699999988079071; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">FIG 2. view from office</span></div></div><div id="1208:19" style="z-index: 21; transform: matrix(0.9937077760696411,-0.11200381815433502,0.11200381815433502,0.9937077760696411,0,0); transform-origin: 0% 0%; position: absolute; left: 24.10540771484375px; bottom: 122.29022216796875px; display: flex; flex-direction: row; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-end; "><div id="1208:20" style="position: static; left: 0px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:20;578:15" style="position: static; left: calc(50% - 16.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://risd.gd">RISD</a></span></div></div><div id="1208:21" style="position: static; left: 53px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:21;578:15" style="position: static; left: calc(50% - 36px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://upperquad.com/">Upperquad</a></span></div></div><div id="1208:22" style="position: static; left: 145px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:22;578:15" style="position: static; left: calc(50% - 35.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://metahaven.net/">Metahaven</a></span></div></div><div id="1208:23" style="position: static; left: 236px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:23;578:15" style="position: static; left: calc(50% - 41.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://maps.google.com/">Google Maps</a></span></div></div></div><div id="1208:27" style="transform: matrix(0.9911307096481323,-0.13289108872413635,0.13289108872413635,0.9911307096481323,0,0); transform-origin: 0% 0%; width: 301.5408630371094px; position: absolute; left: calc(50% - 150.7704315185547px - 4.229587554931641px); top: 92.81343841552734px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:27;495:30" style="width: 289.5408630371094px; position: static; left: calc(50% - 144.7704315185547px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I’m currently @ Google’s Creative Lab.</span></div></div><div id="1208:28" style="transform: matrix(0.9937077760696411,-0.11200381815433502,0.11200381815433502,0.9937077760696411,0,0); transform-origin: 0% 0%; position: absolute; left: 19.06524658203125px; bottom: 162.007080078125px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:28;578:15" style="position: static; left: calc(50% - 114.5px - 0px); height: 23px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">Before that, I spent time at:</span></div></div></section>',
				'<section class="frame" style="overflow: hidden; background-image: url(./images/!talk); background-size: cover; border-radius: 2px 2px 2px 2px;  width:100%; height:100%; display:block;" ><div id="761:54" style="z-index: 21; transform: matrix(0.9921972155570984,-0.12467850744724274,0.12467850744724274,0.9921972155570984,0,0); transform-origin: 0% 0%; position: absolute; left: 13.8582763671875px; bottom: 116.57989501953125px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="555:35" style="position: static; left: 0px; bottom: 32px; display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I555:35;578:15" style="position: static; left: calc(50% - 175px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">and teach software/design.</span></div></div><div id="555:40" style="position: static; left: 0px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I555:40;578:15" style="position: static; left: calc(50% - 75.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.notion.so/Design-in-the-Real-World-ac2a96893f034b85b1045025054009ce">Interaction design, SVA</a></span></div></div></div><div id="761:49" style="z-index: 21; transform: matrix(0.982860267162323,-0.18435218930244446,0.18435218930244446,0.982860267162323,0,0); transform-origin: 0% 0%; position: absolute; left: 17.875457763671875px; top: 76.26504516601562px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="761:52" style="position: static; left: 0px; top: 0px; display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:52;578:15" style="position: static; left: calc(50% - 150px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">I also occasionally talk,</span></div></div><div id="1208:40" style="position: static; left: -0.000028642745746765286px; top: 50.0000114440918px; display: flex; flex-direction: row; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; flex: none; flex-grow: 0; "><div id="761:41" style="transform: matrix(1.0000001192092896,5.725459217842399e-9,-5.725459217842399e-9,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 0.00005506980960490182px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:41;578:15" style="position: static; left: calc(50% - 43px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.itsnicethat.com/articles/wix-playground-presents-data-narrative-design-round-up-digital-event-040320">It’s Nice That</a></span></div></div><div id="761:43" style="transform: matrix(1.0000001192092896,5.725459217842399e-9,-5.725459217842399e-9,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 104.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:43;578:15" style="position: static; left: calc(50% - 18px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://design.google/library/span2019/">SPAN</a></span></div></div><div id="761:44" style="position: static; left: 158.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:44;578:15" style="position: static; left: calc(50% - 15.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://thefwa.com/interviews/barron-webster">FWA</a></span></div></div><div id="761:42" style="position: static; left: 207.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:42;578:15" style="position: static; left: calc(50% - 13px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://web.mit.edu/">MIT</a></span></div></div></div></div><div id="761:38" style="z-index: 21; transform: matrix(0.9788978695869446,0.20434996485710144,-0.20434996485710144,0.9788978695869446,0,0); transform-origin: 0% 0%; position: absolute; right: 6.3427734375px; top: calc(50% - 70px - 20.264984130859375px); display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="761:39" style="position: static; right: 14px; top: calc(50% - 22px - 48px); display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:39;578:15" style="position: static; left: calc(50% - 37px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">write,</span></div></div><div id="761:33" style="position: static; right: 0px; top: calc(50% - 13px - 7px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:33;578:15" style="position: static; left: calc(50% - 46px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://design.google/library/designing-and-learning-teachable-machine/">Google Design</a></span></div></div><div id="761:34" style="transform: matrix(1.0000001192092896,-5.551115123125783e-17,5.551115123125783e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 0px; top: 82px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:34;578:15" style="position: static; left: calc(50% - 43px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.itsnicethat.com/news/pay-interns-why-it-matters-barron-webster-opinion-180918">It’s Nice That</a></span></div></div><div id="761:32" style="position: static; right: 40px; top: calc(50% - 13px - -57px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:32;578:15" style="position: static; left: calc(50% - 26px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://medium.com/@warronbebster/the-future-of-augmented-reality-will-be-boring-fc95be238ef4">Medium</a></span></div></div></div></section>',
			],
		},
		{
			name: 'Projects',
			stories: [
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1197:3" style="transform: matrix(0.9889853000640869,-0.14801350235939026,0.14801350235939026,0.9889853000640869,0,0); transform-origin: 0% 0%; width: 351.2443542480469px; position: absolute; left: calc(50% - 175.62217712402344px - 12.377822875976562px); height: 196.723876953125px; top: 397.1864013671875px; background-image: url(./images/TM_screenshot_2); background-size: cover; border-radius: 4px 4px 4px 4px; "></div><div id="1197:14" style="transform: matrix(0.9942525029182434,0.1070602536201477,-0.1070602536201477,0.9942525029182434,0,0); transform-origin: 0% 0%; width: 351.2443542480469px; position: absolute; left: calc(50% - 175.62217712402344px - -12.786666870117188px); height: 196.723876953125px; top: 73px; background-image: url(./images/what); background-size: cover; border-radius: 4px 4px 4px 4px; "></div><div id="1197:4" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 196.77989196777344px; position: absolute; left: calc(50% - 98.38994598388672px - -0.38994598388671875px); top: 336px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1197:4;495:30" style="width: 184.77989196777344px; position: static; left: calc(50% - 92.38994598388672px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">It’s a web tool for training AI models, no coding required.</span></div></div><div id="1197:15" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 120px - 0px); top: 618px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1197:15;578:15" style="position: static; left: calc(50% - 114px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://twitter.com/search?q=%23teachablemachine&f=live">See what people have made with it.</a></span></div></div><div id="1197:12" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 234.99996948242188px; position: absolute; left: calc(50% - 117.49998474121094px - -0.4999847412109375px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1197:12;495:30" style="width: 222.99996948242188px; position: static; left: calc(50% - 111.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="17">I led design for </span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="34"> <a href="https://teachablemachine.withgoogle.com/">Teachable Machine</a></span><span key="end">:</span></div></div></section>',
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1201:5" style="transform: matrix(0.9902680516242981,0.13917309045791626,-0.13917309045791626,0.9902680516242981,0,0); transform-origin: 0% 0%; width: 351.2443542480469px; position: absolute; left: calc(50% - 175.62217712402344px - -15.645126342773438px); height: 196.723876953125px; top: 409px; overflow: hidden; background-color: rgba(196, 196, 196, 1); border-radius: 4px 4px 4px 4px; "><video autoplay loop muted style="width: 100%; height: auto; position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%)"><source src="./videos/lens.mp4" type="video/mp4"/>Your browser does not support the video tag. I suggest you upgrade your browser.</video></div><div id="1201:6" style="transform: matrix(0.9942448139190674,-0.10713174939155579,0.10713174939155579,0.9942448139190674,0,0); transform-origin: 0% 0%; width: 351.2443542480469px; position: absolute; left: calc(50% - 175.62217712402344px - 13.377822875976562px); height: 275.9039611816406px; top: 120.61761474609375px; background-image: url(./images/lens_IO); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="1201:9" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 242.99996948242188px; position: absolute; left: calc(50% - 121.49998474121094px - -0.4999847412109375px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:9;495:30" style="width: 230.99996948242188px; position: static; left: calc(50% - 115.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="26">I helped design & launch  </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="end"> <a href="https://lens.google.com/">Google Lens:</a></span></div></div></section>',
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="705:2" style="transform: matrix(0.9957780838012695,-0.09179326146841049,0.09179326146841049,0.9957780838012695,0,0); transform-origin: 0% 0%; width: 275.12445068359375px; position: absolute; right: 26.35101318359375px; height: 150.45867919921875px; bottom: 83.65737915039062px; background-image: url(./images/payinterns); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="705:3" style="transform: matrix(0.9971057772636414,0.07602643966674805,-0.07602643966674805,0.9971057772636414,0,0); transform-origin: 0% 0%; width: 271.7166442871094px; position: absolute; left: 21.9697265625px; height: 146.18218994140625px; top: calc(50% - 73.09109497070312px - 14.35321044921875px); background-image: url(./images/welcomeback); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="705:4" style="transform: matrix(0.9889853000640869,-0.14801350235939026,0.14801350235939026,0.9889853000640869,0,0); transform-origin: 0% 0%; width: 282.1027526855469px; position: absolute; right: 24.838043212890625px; height: 157.99925231933594px; top: 106.83811950683594px; background-image: url(./images/vote_screenshot); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="705:6" style="z-index: 21; transform: matrix(0.9889854192733765,-0.14801351726055145,0.14801351726055145,0.9889854192733765,0,0); transform-origin: 0% 0%; width: 143.08432006835938px; position: absolute; right: 173.12234497070312px; top: 211.56002807617188px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:6;495:30" style="width: 131.08432006835938px; position: static; left: calc(50% - 65.54216003417969px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://techcrunch.com/2018/11/06/googles-doodle-commands-you-to-go-vote/">Google’s first voting doodle in 2018</a></span></div></div><div id="705:7" style="z-index: 21; transform: matrix(0.9957782030105591,-0.09179326891899109,0.09179326891899109,0.9957782030105591,0,0); transform-origin: 0% 0%; width: 201.4622344970703px; position: absolute; right: 108.82475280761719px; bottom: 92.97314453125px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:7;495:30" style="width: 189.4622344970703px; position: static; left: calc(50% - 94.73111724853516px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://payinterns.nyc">A list of NYC offices that pay creative interns a living wage</a></span></div></div><div id="705:9" style="z-index: 21; transform: matrix(0.9971058964729309,0.07602645456790924,-0.07602645456790924,0.9971058964729309,0,0); transform-origin: 0% 0%; width: 192.53700256347656px; position: absolute; left: 114.230224609375px; top: calc(50% - 22px - -31.124053955078125px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:9;495:30" style="width: 180.53700256347656px; position: static; left: calc(50% - 90.26850128173828px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://welcomeback.nyc">A web store where only one person can shop at a time</a></span></div></div><div id="1201:16" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 57.5px - 0.5000152587890625px); top: 33px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:16;578:15" style="position: static; left: calc(50% - 51.5px - 0px); height: 31px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And also:</span></div></div></section>',
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="709:3" style="transform: matrix(0.9971598386764526,0.07531432807445526,-0.07531432807445526,0.9971598386764526,0,0); transform-origin: 0% 0%; width: 307.0051574707031px; position: absolute; left: 22.251220703125px; height: 160.81222534179688px; bottom: 100.14288330078125px; background-image: url(./images/covid); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="709:2" style="transform: matrix(0.9985552430152893,-0.053734373301267624,0.053734373301267624,0.9985552430152893,0,0); transform-origin: 0% 0%; width: 302.1517333984375px; position: absolute; right: 19.601806640625px; height: 154.39085388183594px; top: calc(50% - 77.19542694091797px - -7.064842224121094px); background-image: url(./images/enhance); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="704:0" style="transform: matrix(0.9946823120117188,0.10299064218997955,-0.10299064218997955,0.9946823120117188,0,0); transform-origin: 0% 0%; width: 204.20816040039062px; position: absolute; left: 26.0853271484375px; height: 163.59857177734375px; top: 71.63104248046875px; background-image: url(./images/lens2); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="721:0" style="transform: matrix(0.9946824312210083,0.10299064964056015,-0.10299064964056015,0.9946824312210083,0,0); transform-origin: 0% 0%; width: 188.84039306640625px; position: absolute; left: 102.35546875px; top: 207.05210876464844px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:0;495:30" style="width: 176.84039306640625px; position: static; left: calc(50% - 88.42019653320312px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end">Prototyping the first Google Home devices w/ screens</span></div></div><div id="721:3" style="z-index: 21; transform: matrix(0.9985553622245789,-0.05373437702655792,0.05373437702655792,0.9985553622245789,0,0); transform-origin: 0% 0%; position: absolute; right: 99.802734375px; top: calc(50% - 13px - -59.225006103515625px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:3;578:15" style="position: static; left: calc(50% - 109.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://enhance.computer">A cyberpunk detective voice game</a></span></div></div><div id="721:5" style="z-index: 21; transform: matrix(0.9971599578857422,0.07531433552503586,-0.07531433552503586,0.9971599578857422,0,0); transform-origin: 0% 0%; width: 178.79794311523438px; position: absolute; left: 156.6268310546875px; bottom: 100.614990234375px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:5;495:30" style="width: 166.79794311523438px; position: static; left: calc(50% - 83.39897155761719px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://google.com/covid19/mobility/">Global mobility reports for understanding COVID</a></span></div></div><div id="1201:19" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 57.5px - 0.5px); top: 33px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:19;578:15" style="position: static; left: calc(50% - 51.5px - 0px); height: 31px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And also:</span></div></div></section>',
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1201:0" style="transform: matrix(0.9540171027183533,0.2997521460056305,-0.2997521460056305,0.9540171027183533,0,0); transform-origin: 0% 0%; width: 345.5052185058594px; position: absolute; left: -44.982879638671875px; height: 346.865478515625px; top: 13.159995079040527px; background-image: url(./images/BeyBlade); background-size: cover; "></div><div id="1201:13" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 234.99996948242188px; position: absolute; left: calc(50% - 117.49998474121094px - -0.4999847412109375px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:13;495:30" style="width: 222.99996948242188px; position: static; left: calc(50% - 111.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I also used to make dumb t-shirts:</span></div></div><div id="1201:2" style="transform: matrix(0.8501306772232056,0.5265717506408691,-0.5265717506408691,0.8501306772232056,0,0); transform-origin: 0% 0%; width: 434.91143798828125px; position: absolute; left: -0.1138116866350174px; height: 436.5714416503906px; top: 338px; background-image: url(./images/Infinitywar); background-size: cover; "></div><div id="1201:1" style="transform: matrix(0.9515489339828491,-0.30749738216400146,0.30749738216400146,0.9515489339828491,0,0); transform-origin: 0% 0%; width: 381.4112854003906px; position: absolute; right: -83.41128540039062px; height: 381.4112854003906px; top: 275.282958984375px; background-image: url(./images/Grimes); background-size: cover; "></div></section>',
			],
		},
		{
			name: 'Thoughts',
			stories: [
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(178, 242, 246, 1) 0%, rgba(157, 186, 228, 1) 100%);  width:100%; height:100%; display:block;" ><div id="752:2" style="transform: matrix(0.9916291832923889,0.12911826372146606,-0.12911826372146606,0.9916291832923889,0,0); transform-origin: 0% 0%; width: 220px; position: absolute; left: 27.969314575195312px; height: 138px; top: 114.93780517578125px; background-image: url(./images/markets); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="752:3" style="transform: matrix(0.9980056881904602,0.06312429904937744,-0.06312429904937744,0.9980056881904602,0,0); transform-origin: 0% 0%; width: 231px; position: absolute; left: 21.963134765625px; height: 149px; bottom: 95.08914184570312px; background-image: url(./images/cars); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="752:4" style="transform: matrix(0.9903979301452637,-0.13824567198753357,0.13824567198753357,0.9903979301452637,0,0); transform-origin: 0% 0%; width: 235px; position: absolute; right: 23.737625122070312px; height: 142px; top: calc(50% - 71px - -30.70050048828125px); background-image: url(./images/infographic); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="752:5" style="transform: matrix(0.9916293025016785,0.12911827862262726,-0.12911827862262726,0.9916293025016785,0,0); transform-origin: 0% 0%; width: 217.27194213867188px; position: absolute; left: 74.89610290527344px; top: 203.74026489257812px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:5;495:30" style="width: 205.27194213867188px; position: static; left: calc(50% - 102.63597106933594px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">global accountability structures outside of financial markets</span></div></div><div id="752:6" style="transform: matrix(0.9980058073997498,0.06312430649995804,-0.06312430649995804,0.9980058073997498,0,0); transform-origin: 0% 0%; width: 193.99996948242188px; position: absolute; left: 82.895751953125px; bottom: 102.04730606079102px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:6;495:30" style="width: 181.99996948242188px; position: static; left: calc(50% - 90.99998474121094px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Cities being planned around the infernal automobile</span></div></div><div id="752:7" style="transform: matrix(0.9903980493545532,-0.13824568688869476,0.13824568688869476,0.9903980493545532,0,0); transform-origin: 0% 0%; position: absolute; right: 146.88185119628906px; top: calc(50% - 13px - -80.58584594726562px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:7;578:15" style="position: static; left: calc(50% - 53px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Systems literacy</span></div></div><div id="752:8" style="width: 253px; position: absolute; left: calc(50% - 126.5px - 0.5px); top: 50px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:8;495:30" style="width: 241px; position: static; left: calc(50% - 120.5px - 0px); height: 46px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Here are some big problems I think need solving:</span></div></div></section>',
				'<section class="frame" style="overflow: hidden; background: linear-gradient(-2.356194490192345rad, rgba(178, 242, 246, 1) 0%, rgba(157, 186, 228, 1) 100%);  width:100%; height:100%; display:block;" ><div id="799:47" style="transform: matrix(0.996673047542572,0.08150499314069748,-0.08150499314069748,0.996673047542572,0,0); transform-origin: 0% 0%; position: absolute; left: 11.067291259765625px; top: 184.26699829101562px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:47;578:15" style="position: static; left: calc(50% - 127px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(198, 240, 217, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Capital inheritance should be abolished</span></div></div><div id="800:11" style="transform: matrix(0.9916293025016785,0.12911827862262726,-0.12911827862262726,0.9916293025016785,0,0); transform-origin: 0% 0%; position: absolute; left: 43.357086181640625px; top: 87px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I800:11;578:15" style="position: static; left: calc(50% - 76px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 218, 221, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Meritocracy is a fantasy</span></div></div><div id="799:48" style="z-index: 21; transform: matrix(0.968247652053833,-0.24999360740184784,0.24999360740184784,0.968247652053833,0,0); transform-origin: 0% 0%; width: 267.3401184082031px; position: absolute; right: 12.660125732421875px; top: calc(50% - 31px - -16.917572021484375px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:48;495:30" style="width: 255.34011840820312px; position: static; left: calc(50% - 127.67005920410156px - 0px); height: 54px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(239, 174, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="90">Cars force societies to compromise community and livability. Subsidizing them the way the </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; color: rgba(239, 174, 255, 1); " key="99"> <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3345366">U.S. does</a></span><span key="end"> is abhorent</span></div></div><div id="800:13" style="transform: matrix(0.9980058073997498,0.06312430649995804,-0.06312430649995804,0.9980058073997498,0,0); transform-origin: 0% 0%; width: 228.68594360351562px; position: absolute; left: 16.049957275390625px; bottom: 231px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I800:13;495:30" style="width: 216.68594360351562px; position: static; left: calc(50% - 108.34297180175781px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(249, 214, 214, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Food, health, shelter and education are fundamental human rights and markets cannot provide them to everyone</span></div></div><div id="801:2" style="transform: matrix(0.9943656921386719,-0.10600520670413971,0.10600520670413971,0.9943656921386719,0,0); transform-origin: 0% 0%; width: 254.84788513183594px; position: absolute; right: 26.608932495117188px; bottom: 76.98480224609375px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I801:2;495:30" style="width: 242.84788513183594px; position: static; left: calc(50% - 121.42394256591797px - 0px); height: 108px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(187, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Human intelligence is not exceptional; there are many other types of information organization  better at solving different problems. We are ripe with cognitive flaws and biases, especially at scale</span></div></div><div id="799:49" style="transform: matrix(0.9903980493545532,-0.13824568688869476,0.13824568688869476,0.9903980493545532,0,0); transform-origin: 0% 0%; width: 210.4332733154297px; position: absolute; left: 15px; top: calc(50% - 40px - 60.90850830078125px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:49;495:30" style="width: 198.4332733154297px; position: static; left: calc(50% - 99.21663665771484px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(199, 254, 179, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Traditional Westphalian nation-states are ill-equipped to solve modern problems. Borders should be abolished</span></div></div><div id="801:6" style="transform: matrix(0.9983980059623718,-0.05658261850476265,0.05658261850476265,0.9983980059623718,0,0); transform-origin: 0% 0%; width: 228.1027069091797px; position: absolute; right: 16.013107299804688px; top: 144.04443359375px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I801:6;495:30" style="width: 216.1027069091797px; position: static; left: calc(50% - 108.05135345458984px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 232, 108, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Freedom to speak does not mean freedom from consequences</span></div></div><div id="799:50" style="position: absolute; left: calc(50% - 112.5px - 0px); top: 50px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:50;578:15" style="position: static; left: calc(50% - 106.5px - 0px); height: 23px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And some current beliefs:</span></div></div><div id="808:1" style="transform: matrix(0.9980047345161438,0.06313889473676682,-0.06313889473676682,0.9980047345161438,0,0); transform-origin: 0% 0%; position: absolute; left: 255.75860595703125px; height: 54px; bottom: 238.65087890625px; color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:2" style="transform: matrix(0.9943564534187317,-0.10609052330255508,0.10609052330255508,0.9943564534187317,0,0); transform-origin: 0% 0%; position: absolute; right: 293px; height: 42px; bottom: 111.2711181640625px; color: rgba(0, 0, 0, 1); font-size: 42px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:3" style="position: absolute; left: 234px; height: 44px; top: calc(50% - 22px - 95px); color: rgba(0, 0, 0, 1); font-size: 44px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:5" style="transform: matrix(0.9861655235290527,0.16576355695724487,-0.16576355695724487,0.9861655235290527,0,0); transform-origin: 0% 0%; position: absolute; right: 305.3640441894531px; height: 34px; top: calc(50% - 17px - -8px); color: rgba(0, 0, 0, 1); font-size: 34px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:4" style="transform: matrix(0.9844132661819458,0.1758708953857422,-0.1758708953857422,0.9844132661819458,0,0); transform-origin: 0% 0%; position: absolute; right: 246.789306640625px; height: 41px; top: 131px; color: rgba(0, 0, 0, 1); font-size: 41px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div></section>',
			],
		},
		{
			name: 'This Site',
			stories: [
				'<section class="frame" style="overflow: hidden; background-color: rgba(229, 229, 229, 1);  width:100%; height:100%; display:block;" ><div id="759:0" style="width: 337px; position: absolute; left: calc(50% - 168.5px - 0.5px); height: 196px; top: calc(50% - 98px - 6px); background-image: url(./images/figma); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="754:5" style="z-index: 21; transform: matrix(1.0000001192092896,-1.3877787807814457e-17,1.3877787807814457e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 217.27194213867188px; position: absolute; left: calc(50% - 108.63597106933594px - 0.3640289306640625px); top: calc(50% - 22px - -92px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I754:5;495:30" style="width: 205.27194213867188px; position: static; left: calc(50% - 102.63597106933594px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="21"> <a href="https://bit.ly/2SqieMK">Here’s the Figma file</a></span><span key="end"> if you want a peek under the hood.</span></div></div><div id="761:56" style="z-index: 21; transform: matrix(1.0000001192092896,-2.7755578924351364e-17,2.7755578924351364e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 121.5px - 0.5px); height: 16px; bottom: 99.9681396484375px; opacity: 0.5; color: rgba(0, 0, 0, 1); font-size: 12px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="4">And </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="14"> <a href="https://github.com/warronbebster/bwebsite">the github</a></span><span key="end"> if you wanna go even deeper.</span></div><div id="754:8" style="width: 284px; position: absolute; left: calc(50% - 142px - 0px); top: 74px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I754:8;495:30" style="width: 272px; position: static; left: calc(50% - 136px - 0px); height: 69px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">This site is built from scratch and updates live from a Figma file, so I can update it whenever.</span></div></div><div id="761:76" style="transform: matrix(0.9293728470802307,-0.3691423535346985,0.3691423535346985,0.9293728470802307,0,0); transform-origin: 0% 0%; width: 50px; position: absolute; left: 37px; height: 50px; top: calc(50% - 25px - 101.54287719726562px); overflow: hidden; background-color: rgba(30, 30, 30, 1); border-radius: 8px 8px 8px 8px; "><div id="761:77" style="width: 22px; position: absolute; left: calc(50% - 11px - 0px); height: 34px; top: calc(50% - 17px - 0px); background-image: url(./images/figmaLogo); background-size: cover; "></div></div></section>',
			],
		},
		{
			name: 'Contact',
			stories: [
				'<section class="frame" style="overflow: hidden; background-image: url(./images/!contact); background-size: cover;  width:100%; height:100%; display:block;" ><div id="583:1" style="z-index: 21; position: absolute; left: calc(50% - 89.5px - 0.5px); top: calc(50% - 17.5px - 4.5px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><svg preserveAspectRatio="none" width="23.000001907348633" height="18.687501907348633" style="transform: matrix(0.9999999403953552,-1.3877787807814457e-17,1.3877787807814457e-17,0.9999999403953552,0,0); transform-origin: 0% 0%; width: 12.84916307673108%; left: 3.35195530726257%; height: 53.39286259242466%; top: 23.303571428571427%; flex: none; position: static; flex-grow: 0; margin-right: 6px; " viewBox="0 0 23.000001907348633 18.687501907348633" xmlns="http://www.w3.org/2000/svg"> <path d="M23 2.21265C22.1542 2.58733 21.2456 2.84049 20.2904 2.95492C21.2648 2.37163 22.0124 1.44607 22.3649 0.344302C21.4532 0.885059 20.4433 1.27797 19.3686 1.4886C18.5076 0.573162 17.2819 0 15.9246 0C13.3193 0 11.2062 2.11239 11.2062 4.71896C11.2062 5.08757 11.2488 5.44605 11.3278 5.79238C7.40465 5.59491 3.92923 3.71644 1.60147 0.862781C1.19629 1.56151 0.963314 2.37163 0.963314 3.23441C0.963314 4.87086 1.79697 6.31592 3.06214 7.16148C2.28825 7.13617 1.56095 6.92452 0.924822 6.57111L0.924822 6.63187C0.924822 8.91742 2.5506 10.8243 4.71021 11.2577C4.31313 11.365 3.89681 11.4217 3.46732 11.4217C3.16344 11.4217 2.86664 11.3934 2.57897 11.3387C3.17964 13.2121 4.92192 14.5771 6.98732 14.6136C5.37167 15.8794 3.33665 16.6338 1.1264 16.6338C0.74553 16.6338 0.369726 16.6116 0 16.568C2.0887 17.9078 4.5684 18.6875 7.23245 18.6875C15.9134 18.6875 20.6591 11.4997 20.6591 5.2658C20.6591 5.06327 20.654 4.85871 20.6449 4.65618C21.5667 3.98985 22.3669 3.16049 22.998 2.21569L23 2.21265Z" fill="rgba(29, 161, 242, 1)" stroke="" stroke-width="1"></path></svg><div id="583:2" style="position: static; left: calc(50% - 69px - -14.5px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="1">@</span><span key="end"><a href="https://twitter.com/WarronBebster">warronbebster</a></span></div></div><div id="583:3" style="z-index: 21; position: absolute; left: calc(50% - 89.5px - 0.5px); top: calc(50% - 17.5px - -54.935028076171875px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="581:33" style="width: 23px; position: static; left: 6px; height: 23px; top: 6px; flex: none; flex-grow: 0; margin-right: 6px; background-image: url(./images/ig); background-size: cover; "></div><div id="583:4" style="position: static; left: calc(50% - 69px - -14.5px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="1">@</span><span key="end"><a href="https://www.instagram.com/barronwebster/">barronwebster</a></span></div></div><div id="583:5" style="position: absolute; left: calc(50% - 115px - 0.5px); top: calc(50% - 17.5px - -113.93502807617188px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="583:6" style="position: static; left: calc(50% - 109px - 0px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="5">hello</span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="6">@</span><span key="end">barronwebster.com</span></div></div><div id="785:44" style="transform: matrix(0.9876883625984192,-0.15643446147441864,0.15643446147441864,0.9876883625984192,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 82px - 1px); height: 31px; top: 163.5265655517578px; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">want to say hi?</span></div></section>',
			],
		},
	];

	// export const currentPos = writable({ project: 0, story: 0 }); //export current number... and total number so it knows when to cycle?

	const projectArray = figmaProject; //write output of figma script here

	const getNext = function (posToCheck) {
		let nextPos = { project: 0, story: 0 };
		// console.log(parseInt(posToCheck.project));

		if (!Number.isInteger(parseInt(posToCheck.project))) {
			//if it's not a number
			return nextPos; //return 0,0
		} else if (parseInt(posToCheck.project) >= projectArray.length || posToCheck < 0) {
			//if it's above project amount
			return nextPos; //return 0,0
		} else {
			//if it's legit
			posToCheck.story = parseInt(posToCheck.story);
			nextPos.project = parseInt(posToCheck.project);
			nextPos.story = parseInt(posToCheck.story);
			if (
				//if it's not the last story in a project
				posToCheck.story <
				projectArray[posToCheck.project].stories.length - 1
			) {
				nextPos.story++; //add 1 to story value
			} else {
				//if it's the last story in a project
				if (posToCheck.project < projectArray.length - 1) {
					//if it's not the last project
					nextPos.project++; //add 1 to story value
					nextPos.story = 0; //reset story to beginning
				} else {
					//if it's the last project
					nextPos.story = 0; //reset story to beginning
					nextPos.project = 0; //reset project to beginning;
				}
			}
			return nextPos;
		}
	};

	const getPrev = function (posToCheck) {
		let prevPos = { project: 0, story: 0 };
		if (!Number.isInteger(parseInt(posToCheck.project))) {
			//if it's not a number
			return prevPos; //return 0,0
		} else if (parseInt(posToCheck.project) >= projectArray.length || posToCheck < 0) {
			//if it's above project amount
			return prevPos; //return 0,0
		} else {
			// posToCheck.project = parseInt(posToCheck.project);
			posToCheck.story = parseInt(posToCheck.story);
			prevPos.project = posToCheck.project; //start by setting a new variable to what we're checking against
			prevPos.story = posToCheck.story;
			if (
				//if it's not the first story in a project
				posToCheck.story > 0
			) {
				prevPos.story--;
			} else {
				//if it's the first story in a project
				if (posToCheck.project > 0) {
					//if it's not the first project
					prevPos.project--;
					prevPos.story = projectArray[posToCheck.project - 1].stories.length - 1;
				} else {
					//if it's the first project
					prevPos.project = projectArray.length - 1;
					prevPos.story = projectArray[projectArray.length - 1].stories.length - 1;
				}
			}
			return prevPos;
		}
	};

	// export const plus1 = derived(currentPos, ($currentPos) => getNext($currentPos));

	// export const plus2 = derived(plus1, ($plus1) => getNext($plus1));

	// export const minus1 = derived(currentPos, ($currentPos) => getPrev($currentPos));

	// export const minus2 = derived(minus1, ($minus1) => getPrev($minus1));

	/* src/components/Story.svelte generated by Svelte v3.20.1 */
	const file = 'src/components/Story.svelte';

	// (83:2) {:else}
	function create_else_block$1(ctx) {
		let section;

		const block = {
			c: function create() {
				section = element('section');
				section.textContent = 'loading…';
				add_location(section, file, 83, 4, 1551);
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(section);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_else_block$1.name,
			type: 'else',
			source: '(83:2) {:else}',
			ctx,
		});

		return block;
	}

	// (81:2) {#if showStoryContent}
	function create_if_block$1(ctx) {
		let html_tag;

		const block = {
			c: function create() {
				html_tag = new HtmlTag(/*storyContent*/ ctx[0], null);
			},
			m: function mount(target, anchor) {
				html_tag.m(target, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*storyContent*/ 1) html_tag.p(/*storyContent*/ ctx[0]);
			},
			d: function destroy(detaching) {
				if (detaching) html_tag.d();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$1.name,
			type: 'if',
			source: '(81:2) {#if showStoryContent}',
			ctx,
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let div;
		let div_class_value;

		function select_block_type(ctx, dirty) {
			if (/*showStoryContent*/ ctx[2]) return create_if_block$1;
			return create_else_block$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				div = element('div');
				if_block.c();
				attr_dev(
					div,
					'class',
					(div_class_value = 'story ' + /*displayPosition*/ ctx[1] + ' ' + ' svelte-18j0idr')
				);
				add_location(div, file, 79, 0, 1448);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option'
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if_block.m(div, null);
			},
			p: function update(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div, null);
					}
				}

				if (
					dirty & /*displayPosition*/ 2 &&
					div_class_value !==
						(div_class_value = 'story ' + /*displayPosition*/ ctx[1] + ' ' + ' svelte-18j0idr')
				) {
					attr_dev(div, 'class', div_class_value);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if_block.d();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$1.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { storyContent = '<section>loading…</section' } = $$props; //prop so that you can pass which project from App
		let { current = false } = $$props;
		let { nextCover = false } = $$props;
		let { next = false } = $$props;
		let { prev = false } = $$props;
		let displayPosition = 'none';
		let showStoryContent = false;

		beforeUpdate(() => {
			if (next) {
				$$invalidate(1, (displayPosition = 'plus1'));
				$$invalidate(2, (showStoryContent = true));
			} else if (current) {
				$$invalidate(1, (displayPosition = 'currentStory'));
				$$invalidate(2, (showStoryContent = true));
			} else if (prev) {
				$$invalidate(1, (displayPosition = 'minus1'));
				$$invalidate(2, (showStoryContent = true));
			} else {
				$$invalidate(1, (displayPosition = 'none'));
			}

			if (nextCover) {
				$$invalidate(2, (showStoryContent = true));
				$$invalidate(1, (displayPosition += ' nextCover'));
			}
		});

		const writable_props = ['storyContent', 'current', 'nextCover', 'next', 'prev'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$')
				console.warn(`<Story> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots('Story', $$slots, []);

		$$self.$set = ($$props) => {
			if ('storyContent' in $$props) $$invalidate(0, (storyContent = $$props.storyContent));
			if ('current' in $$props) $$invalidate(3, (current = $$props.current));
			if ('nextCover' in $$props) $$invalidate(4, (nextCover = $$props.nextCover));
			if ('next' in $$props) $$invalidate(5, (next = $$props.next));
			if ('prev' in $$props) $$invalidate(6, (prev = $$props.prev));
		};

		$$self.$capture_state = () => ({
			beforeUpdate,
			storyContent,
			current,
			nextCover,
			next,
			prev,
			displayPosition,
			showStoryContent,
		});

		$$self.$inject_state = ($$props) => {
			if ('storyContent' in $$props) $$invalidate(0, (storyContent = $$props.storyContent));
			if ('current' in $$props) $$invalidate(3, (current = $$props.current));
			if ('nextCover' in $$props) $$invalidate(4, (nextCover = $$props.nextCover));
			if ('next' in $$props) $$invalidate(5, (next = $$props.next));
			if ('prev' in $$props) $$invalidate(6, (prev = $$props.prev));
			if ('displayPosition' in $$props)
				$$invalidate(1, (displayPosition = $$props.displayPosition));
			if ('showStoryContent' in $$props)
				$$invalidate(2, (showStoryContent = $$props.showStoryContent));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [storyContent, displayPosition, showStoryContent, current, nextCover, next, prev];
	}

	class Story extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$1, create_fragment$1, safe_not_equal, {
				storyContent: 0,
				current: 3,
				nextCover: 4,
				next: 5,
				prev: 6,
			});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Story',
				options,
				id: create_fragment$1.name,
			});
		}

		get storyContent() {
			throw new Error(
				"<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set storyContent(value) {
			throw new Error(
				"<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get current() {
			throw new Error(
				"<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set current(value) {
			throw new Error(
				"<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get nextCover() {
			throw new Error(
				"<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set nextCover(value) {
			throw new Error(
				"<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get next() {
			throw new Error(
				"<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set next(value) {
			throw new Error(
				"<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get prev() {
			throw new Error(
				"<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set prev(value) {
			throw new Error(
				"<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}
	}

	/* src/components/Nav.svelte generated by Svelte v3.20.1 */
	const file$1 = 'src/components/Nav.svelte';

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		child_ctx[9] = i;
		return child_ctx;
	}

	// (75:4) {#each projectArray as project, i}
	function create_each_block(ctx) {
		let li;
		let t0_value = /*project*/ ctx[7].name + '';
		let t0;
		let t1;
		let li_class_value;
		let dispose;

		function click_handler(...args) {
			return /*click_handler*/ ctx[4](/*i*/ ctx[9], ...args);
		}

		const block = {
			c: function create() {
				li = element('li');
				t0 = text(t0_value);
				t1 = space();

				attr_dev(
					li,
					'class',
					(li_class_value =
						' navItem ' +
						/*projectIndex*/ (ctx[0] == /*i*/ ctx[9] ? 'activeNavItem' : 'inactiveNavItem') +
						'\n        ' +
						/*navOpen*/ (ctx[1]
							? 'visible'
							: /*projectIndex*/ ctx[0] !== /*i*/ ctx[9]
							? 'hidden'
							: 'visible') +
						'\n        ' +
						' svelte-iymz21')
				);

				add_location(li, file$1, 75, 6, 1532);
			},
			m: function mount(target, anchor, remount) {
				insert_dev(target, li, anchor);
				append_dev(li, t0);
				append_dev(li, t1);
				if (remount) dispose();
				dispose = listen_dev(li, 'click', click_handler, false, false, false);
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (
					dirty & /*projectIndex, navOpen*/ 3 &&
					li_class_value !==
						(li_class_value =
							' navItem ' +
							/*projectIndex*/ (ctx[0] == /*i*/ ctx[9] ? 'activeNavItem' : 'inactiveNavItem') +
							'\n        ' +
							/*navOpen*/ (ctx[1]
								? 'visible'
								: /*projectIndex*/ ctx[0] !== /*i*/ ctx[9]
								? 'hidden'
								: 'visible') +
							'\n        ' +
							' svelte-iymz21')
				) {
					attr_dev(li, 'class', li_class_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(li);
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block.name,
			type: 'each',
			source: '(75:4) {#each projectArray as project, i}',
			ctx,
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let nav;
		let ol;
		let nav_class_value;
		let dispose;
		let each_value = projectArray;
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				nav = element('nav');
				ol = element('ol');

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(ol, 'class', 'svelte-iymz21');
				add_location(ol, file$1, 72, 2, 1481);
				attr_dev(
					nav,
					'class',
					(nav_class_value =
						'' + (null_to_empty(/*navOpen*/ ctx[1] ? 'open' : 'closed') + ' svelte-iymz21'))
				);
				add_location(nav, file$1, 60, 0, 1251);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option'
				);
			},
			m: function mount(target, anchor, remount) {
				insert_dev(target, nav, anchor);
				append_dev(nav, ol);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ol, null);
				}

				if (remount) run_all(dispose);

				dispose = [
					listen_dev(nav, 'mouseover', /*mouseover_handler*/ ctx[5], false, false, false),
					listen_dev(nav, 'mouseleave', /*mouseleave_handler*/ ctx[6], false, false, false),
				];
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*projectIndex, navOpen, window, dispatch, showNav, projectArray*/ 15) {
					each_value = projectArray;
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ol, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (
					dirty & /*navOpen*/ 2 &&
					nav_class_value !==
						(nav_class_value =
							'' + (null_to_empty(/*navOpen*/ ctx[1] ? 'open' : 'closed') + ' svelte-iymz21'))
				) {
					attr_dev(nav, 'class', nav_class_value);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(nav);
				destroy_each(each_blocks, detaching);
				run_all(dispose);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$2.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let { projectIndex = 0 } = $$props; //prop so that you can pass which project from App
		let { navOpen = false } = $$props;
		const dispatch = createEventDispatcher(); //way to dispatch events across components

		function showNav(openOrNot) {
			dispatch('message', { open: openOrNot });
		}

		const writable_props = ['projectIndex', 'navOpen'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$')
				console.warn(`<Nav> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots('Nav', $$slots, []);

		const click_handler = (i) => {
			if (window.innerWidth < 640) {
				if (navOpen) dispatch('project', i);
				projectIndex == i ? showNav(!navOpen) : showNav(false);
			} else {
				dispatch('project', i);
			}
		};

		const mouseover_handler = () => {
			if (window.innerWidth > 640) {
				showNav(true);
			}
		};

		const mouseleave_handler = () => {
			if (window.innerWidth > 640) {
				showNav(false);
			}
		};

		$$self.$set = ($$props) => {
			if ('projectIndex' in $$props) $$invalidate(0, (projectIndex = $$props.projectIndex));
			if ('navOpen' in $$props) $$invalidate(1, (navOpen = $$props.navOpen));
		};

		$$self.$capture_state = () => ({
			projectArray,
			push,
			projectIndex,
			navOpen,
			createEventDispatcher,
			dispatch,
			showNav,
		});

		$$self.$inject_state = ($$props) => {
			if ('projectIndex' in $$props) $$invalidate(0, (projectIndex = $$props.projectIndex));
			if ('navOpen' in $$props) $$invalidate(1, (navOpen = $$props.navOpen));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			projectIndex,
			navOpen,
			dispatch,
			showNav,
			click_handler,
			mouseover_handler,
			mouseleave_handler,
		];
	}

	class Nav extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, not_equal, {
				projectIndex: 0,
				navOpen: 1,
			});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Nav',
				options,
				id: create_fragment$2.name,
			});
		}

		get projectIndex() {
			throw new Error(
				"<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set projectIndex(value) {
			throw new Error(
				"<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get navOpen() {
			throw new Error(
				"<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set navOpen(value) {
			throw new Error(
				"<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}
	}

	/* src/components/Stories.svelte generated by Svelte v3.20.1 */

	const { window: window_1 } = globals;
	const file$2 = 'src/components/Stories.svelte';

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[34] = list[i];
		child_ctx[36] = i;
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[34] = list[i];
		child_ctx[38] = i;
		return child_ctx;
	}

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[30] = list[i].name;
		child_ctx[31] = list[i].stories;
		child_ctx[33] = i;
		return child_ctx;
	}

	// (435:8) {#if params.project == i}
	function create_if_block$2(ctx) {
		let div;
		let each_value_2 = /*stories*/ ctx[31];
		validate_each_argument(each_value_2);
		let each_blocks = [];

		for (let i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
		}

		const block = {
			c: function create() {
				div = element('div');

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(div, 'id', 'indicators');
				attr_dev(div, 'class', 'svelte-n01c88');
				add_location(div, file$2, 436, 10, 11646);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*params, held, navOpen*/ 41) {
					each_value_2 = /*stories*/ ctx[31];
					validate_each_argument(each_value_2);
					let i;

					for (i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_2(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_2.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_each(each_blocks, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$2.name,
			type: 'if',
			source: '(435:8) {#if params.project == i}',
			ctx,
		});

		return block;
	}

	// (447:14) {:else}
	function create_else_block$2(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element('div');
				attr_dev(div, 'class', 'nextIndicators svelte-n01c88');
				add_location(div, file$2, 447, 16, 12041);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_else_block$2.name,
			type: 'else',
			source: '(447:14) {:else}',
			ctx,
		});

		return block;
	}

	// (441:42)
	function create_if_block_2(ctx) {
		let div1;
		let div0;
		let div0_class_value;
		let t;

		const block = {
			c: function create() {
				div1 = element('div');
				div0 = element('div');
				t = space();
				attr_dev(div0, 'id', 'loadingBar');
				attr_dev(
					div0,
					'class',
					(div0_class_value =
						'' +
						(null_to_empty(/*held*/ ctx[3] || /*navOpen*/ ctx[5] ? 'paused' : 'no') +
							' svelte-n01c88'))
				);
				add_location(div0, file$2, 442, 18, 11874);
				attr_dev(div1, 'id', 'currentIndicator');
				attr_dev(div1, 'class', 'svelte-n01c88');
				add_location(div1, file$2, 441, 16, 11828);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div1, t);
			},
			p: function update(ctx, dirty) {
				if (
					dirty[0] & /*held, navOpen*/ 40 &&
					div0_class_value !==
						(div0_class_value =
							'' +
							(null_to_empty(/*held*/ ctx[3] || /*navOpen*/ ctx[5] ? 'paused' : 'no') +
								' svelte-n01c88'))
				) {
					attr_dev(div0, 'class', div0_class_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div1);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_2.name,
			type: 'if',
			source: '(441:42) ',
			ctx,
		});

		return block;
	}

	// (439:14) {#if params.story > p}
	function create_if_block_1(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element('div');
				attr_dev(div, 'class', 'svelte-n01c88');
				add_location(div, file$2, 439, 16, 11761);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_1.name,
			type: 'if',
			source: '(439:14) {#if params.story > p}',
			ctx,
		});

		return block;
	}

	// (438:12) {#each stories as story, p}
	function create_each_block_2(ctx) {
		let if_block_anchor;

		function select_block_type(ctx, dirty) {
			if (/*params*/ ctx[0].story > /*p*/ ctx[38]) return create_if_block_1;
			if (/*params*/ ctx[0].story == /*p*/ ctx[38]) return create_if_block_2;
			return create_else_block$2;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				}
			},
			d: function destroy(detaching) {
				if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block_2.name,
			type: 'each',
			source: '(438:12) {#each stories as story, p}',
			ctx,
		});

		return block;
	}

	// (454:8) {#each stories as story, j}
	function create_each_block_1(ctx) {
		let current;

		const story = new Story({
			props: {
				storyContent: /*story*/ ctx[34],
				current:
					/*params*/ ctx[0].project == /*i*/ ctx[33] && /*params*/ ctx[0].story == /*j*/ ctx[36]
						? true
						: false,
				next:
					/*next*/ ctx[6].project == /*i*/ ctx[33] && /*next*/ ctx[6].story == /*j*/ ctx[36]
						? true
						: false,
				prev:
					/*prev*/ ctx[7].project == /*i*/ ctx[33] && /*prev*/ ctx[7].story == /*j*/ ctx[36]
						? true
						: false,
				nextCover:
					/*i*/ ctx[33] == /*nextProject*/ ctx[8]
						? /*j*/ ctx[36] == /*activeStories*/ ctx[1][/*nextProject*/ ctx[8]]
							? true
							: false
						: /*i*/ ctx[33] == /*prevProject*/ ctx[9]
						? /*j*/ ctx[36] == /*activeStories*/ ctx[1][/*prevProject*/ ctx[9]]
							? true
							: false
						: false,
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(story.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(story, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const story_changes = {};

				if (dirty[0] & /*params*/ 1)
					story_changes.current =
						/*params*/ ctx[0].project == /*i*/ ctx[33] && /*params*/ ctx[0].story == /*j*/ ctx[36]
							? true
							: false;

				if (dirty[0] & /*next*/ 64)
					story_changes.next =
						/*next*/ ctx[6].project == /*i*/ ctx[33] && /*next*/ ctx[6].story == /*j*/ ctx[36]
							? true
							: false;

				if (dirty[0] & /*prev*/ 128)
					story_changes.prev =
						/*prev*/ ctx[7].project == /*i*/ ctx[33] && /*prev*/ ctx[7].story == /*j*/ ctx[36]
							? true
							: false;

				if (dirty[0] & /*nextProject, activeStories, prevProject*/ 770)
					story_changes.nextCover =
						/*i*/ ctx[33] == /*nextProject*/ ctx[8]
							? /*j*/ ctx[36] == /*activeStories*/ ctx[1][/*nextProject*/ ctx[8]]
								? true
								: false
							: /*i*/ ctx[33] == /*prevProject*/ ctx[9]
							? /*j*/ ctx[36] == /*activeStories*/ ctx[1][/*prevProject*/ ctx[9]]
								? true
								: false
							: false;

				story.$set(story_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(story.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(story.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(story, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block_1.name,
			type: 'each',
			source: '(454:8) {#each stories as story, j}',
			ctx,
		});

		return block;
	}

	// (426:4) {#each projectArray as { name, stories }
	function create_each_block$1(ctx) {
		let div;
		let t0;
		let div_class_value;
		let div_style_value;
		let t1;
		let current;
		let if_block = /*params*/ ctx[0].project == /*i*/ ctx[33] && create_if_block$2(ctx);
		let each_value_1 = /*stories*/ ctx[31];
		validate_each_argument(each_value_1);
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		const out = (i) =>
			transition_out(each_blocks[i], 1, 1, () => {
				each_blocks[i] = null;
			});

		const block = {
			c: function create() {
				div = element('div');
				if (if_block) if_block.c();
				t0 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t1 = space();

				attr_dev(
					div,
					'class',
					(div_class_value =
						'project ' +
						/*params*/ (ctx[0].project == /*i*/ ctx[33] ? 'currentProject ' : '') +
						/*i*/ (ctx[33] == /*nextProject*/ ctx[8] ? 'nextProject ' : '') +
						/*i*/ (ctx[33] == /*prevProject*/ ctx[9] ? 'prevProject ' : '') +
						' svelte-n01c88')
				);

				attr_dev(
					div,
					'style',
					(div_style_value =
						'' +
						(/*held*/ (ctx[3] &&
						/*i*/ (ctx[33] == /*params*/ ctx[0].project ||
							/*i*/ ctx[33] == /*nextProject*/ ctx[8] ||
							/*i*/ ctx[33] == /*prevProject*/ ctx[9])
							? 'transform: translateX(' +
							  /*i*/ (ctx[33] == /*prevProject*/ ctx[9]
									? -100
									: /*i*/ ctx[33] == /*nextProject*/ ctx[8]
									? 100
									: 0) +
							  '%) rotateY(' +
							  (Math.min(Math.max(/*gesture_gap*/ ctx[2] / 4.2, -90), 90) +
									/*i*/ (ctx[33] == /*nextProject*/ ctx[8] ? 90 : 0) +
									/*i*/ (ctx[33] == /*prevProject*/ ctx[9] ? -90 : 0)) +
							  'deg) ;'
							: '') +
							'\n        ' +
							/*params*/ (ctx[0].project == /*i*/ ctx[33]
								? 'transform-origin: center ' + /*swipeDirection*/ ctx[4] + ';'
								: '') +
							/*nextProject*/ (ctx[8] == /*i*/ ctx[33] ? 'transform-origin: center left; ' : ' ') +
							/*prevProject*/ (ctx[9] == /*i*/ ctx[33] ? 'transform-origin: center right; ' : ' ') +
							(!(/*held*/ ctx[3])
								? 'transition: left .5s ease, transform .5s ease; '
								: 'transition: left 0s, transform 0s ')))
				);

				add_location(div, file$2, 428, 6, 10660);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if (if_block) if_block.m(div, null);
				append_dev(div, t0);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				insert_dev(target, t1, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (/*params*/ ctx[0].project == /*i*/ ctx[33]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$2(ctx);
						if_block.c();
						if_block.m(div, t0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty[0] & /*params, next, prev, nextProject, activeStories, prevProject*/ 963) {
					each_value_1 = /*stories*/ ctx[31];
					validate_each_argument(each_value_1);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block_1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(div, null);
						}
					}

					group_outros();

					for (i = each_value_1.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				if (
					!current ||
					(dirty[0] & /*params, nextProject, prevProject*/ 769 &&
						div_class_value !==
							(div_class_value =
								'project ' +
								/*params*/ (ctx[0].project == /*i*/ ctx[33] ? 'currentProject ' : '') +
								/*i*/ (ctx[33] == /*nextProject*/ ctx[8] ? 'nextProject ' : '') +
								/*i*/ (ctx[33] == /*prevProject*/ ctx[9] ? 'prevProject ' : '') +
								' svelte-n01c88'))
				) {
					attr_dev(div, 'class', div_class_value);
				}

				if (
					!current ||
					(dirty[0] & /*held, params, nextProject, prevProject, gesture_gap, swipeDirection*/ 797 &&
						div_style_value !==
							(div_style_value =
								'' +
								(/*held*/ (ctx[3] &&
								/*i*/ (ctx[33] == /*params*/ ctx[0].project ||
									/*i*/ ctx[33] == /*nextProject*/ ctx[8] ||
									/*i*/ ctx[33] == /*prevProject*/ ctx[9])
									? 'transform: translateX(' +
									  /*i*/ (ctx[33] == /*prevProject*/ ctx[9]
											? -100
											: /*i*/ ctx[33] == /*nextProject*/ ctx[8]
											? 100
											: 0) +
									  '%) rotateY(' +
									  (Math.min(Math.max(/*gesture_gap*/ ctx[2] / 4.2, -90), 90) +
											/*i*/ (ctx[33] == /*nextProject*/ ctx[8] ? 90 : 0) +
											/*i*/ (ctx[33] == /*prevProject*/ ctx[9] ? -90 : 0)) +
									  'deg) ;'
									: '') +
									'\n        ' +
									/*params*/ (ctx[0].project == /*i*/ ctx[33]
										? 'transform-origin: center ' + /*swipeDirection*/ ctx[4] + ';'
										: '') +
									/*nextProject*/ (ctx[8] == /*i*/ ctx[33]
										? 'transform-origin: center left; '
										: ' ') +
									/*prevProject*/ (ctx[9] == /*i*/ ctx[33]
										? 'transform-origin: center right; '
										: ' ') +
									(!(/*held*/ ctx[3])
										? 'transition: left .5s ease, transform .5s ease; '
										: 'transition: left 0s, transform 0s '))))
				) {
					attr_dev(div, 'style', div_style_value);
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value_1.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (if_block) if_block.d();
				destroy_each(each_blocks, detaching);
				if (detaching) detach_dev(t1);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block$1.name,
			type: 'each',
			source: '(426:4) {#each projectArray as { name, stories }',
			ctx,
		});

		return block;
	}

	function create_fragment$3(ctx) {
		let t;
		let div;
		let main;
		let main_style_value;
		let div_class_value;
		let current;
		let dispose;

		const nav = new Nav({
			props: {
				projectIndex: parseInt(/*params*/ ctx[0].project),
				navOpen: /*navOpen*/ ctx[5],
			},
			$$inline: true,
		});

		nav.$on('message', /*showNav*/ ctx[10]);
		nav.$on('project', /*handleNavProject*/ ctx[11]);
		let each_value = projectArray;
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const out = (i) =>
			transition_out(each_blocks[i], 1, 1, () => {
				each_blocks[i] = null;
			});

		const block = {
			c: function create() {
				create_component(nav.$$.fragment);
				t = space();
				div = element('div');
				main = element('main');

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(
					main,
					'style',
					(main_style_value =
						'transform: translateX(' +
						/*held*/ (ctx[3] ? Math.max(Math.min(/*gesture_gap*/ ctx[2] * 1.1, 460), -460) : 0) +
						'px);\n    ' +
						/*held*/ (ctx[3] ? 'transition: transform 0s;' : 'transition: transform .5s ease;'))
				);

				attr_dev(main, 'class', 'svelte-n01c88');
				add_location(main, file$2, 421, 2, 10391);
				set_style(div, 'overflow', 'hidden');
				set_style(div, 'height', '100vh');
				set_style(div, 'width', '100vw');
				set_style(div, 'display', 'flex');
				set_style(div, 'align-items', 'center');
				set_style(div, 'justify-content', 'center');
				set_style(div, 'perspective', '1080px');
				set_style(div, 'cursor', 'ew-resize');
				attr_dev(
					div,
					'class',
					(div_class_value =
						'' + (null_to_empty(/*held*/ ctx[3] ? 'grabbing' : 'no') + ' svelte-n01c88'))
				);
				add_location(div, file$2, 397, 0, 9826);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option'
				);
			},
			m: function mount(target, anchor, remount) {
				mount_component(nav, target, anchor);
				insert_dev(target, t, anchor);
				insert_dev(target, div, anchor);
				append_dev(div, main);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(main, null);
				}

				current = true;
				if (remount) run_all(dispose);

				dispose = [
					listen_dev(window_1, 'keydown', /*handleKeydown*/ ctx[15], false, false, false),
					listen_dev(div, 'mousedown', /*mousedown_handler*/ ctx[24], false, false, false),
					listen_dev(div, 'mousemove', /*mousemove_handler*/ ctx[25], false, false, false),
					listen_dev(div, 'mouseup', /*mouseup_handler*/ ctx[26], false, false, false),
					listen_dev(
						div,
						'touchstart',
						prevent_default(/*touchstart_handler*/ ctx[27]),
						false,
						true,
						false
					),
					listen_dev(
						div,
						'touchmove',
						/*touchmove_handler*/ ctx[28],
						{ passive: true },
						false,
						false
					),
					listen_dev(
						div,
						'touchend',
						prevent_default(/*touchend_handler*/ ctx[29]),
						false,
						true,
						false
					),
				];
			},
			p: function update(ctx, dirty) {
				const nav_changes = {};
				if (dirty[0] & /*params*/ 1) nav_changes.projectIndex = parseInt(/*params*/ ctx[0].project);
				if (dirty[0] & /*navOpen*/ 32) nav_changes.navOpen = /*navOpen*/ ctx[5];
				nav.$set(nav_changes);

				if (
					dirty[0] &
					/*params, nextProject, prevProject, held, gesture_gap, swipeDirection, next, prev, activeStories, navOpen*/ 1023
				) {
					each_value = projectArray;
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(main, null);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				if (
					!current ||
					(dirty[0] & /*held, gesture_gap*/ 12 &&
						main_style_value !==
							(main_style_value =
								'transform: translateX(' +
								/*held*/ (ctx[3]
									? Math.max(Math.min(/*gesture_gap*/ ctx[2] * 1.1, 460), -460)
									: 0) +
								'px);\n    ' +
								/*held*/ (ctx[3]
									? 'transition: transform 0s;'
									: 'transition: transform .5s ease;')))
				) {
					attr_dev(main, 'style', main_style_value);
				}

				if (
					!current ||
					(dirty[0] & /*held*/ 8 &&
						div_class_value !==
							(div_class_value =
								'' + (null_to_empty(/*held*/ ctx[3] ? 'grabbing' : 'no') + ' svelte-n01c88')))
				) {
					attr_dev(div, 'class', div_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(nav.$$.fragment, local);

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				transition_out(nav.$$.fragment, local);
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(nav, detaching);
				if (detaching) detach_dev(t);
				if (detaching) detach_dev(div);
				destroy_each(each_blocks, detaching);
				run_all(dispose);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$3.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	const swipeSensitivity = 100;
	const storyTimerTime = 6000; //time limit for stories, ms

	function Timer(callback, delay) {
		var timerId,
			start,
			delayStore = delay,
			remaining = delay;

		this.pause = function () {
			window.clearTimeout(timerId);
			remaining -= Date.now() - start;
		};

		this.clear = function () {
			window.clearTimeout(timerId);
		};

		this.resume = function () {
			start = Date.now();
			window.clearTimeout(timerId);
			timerId = window.setTimeout(callback, remaining);
		};

		this.reset = function () {
			start = Date.now();
			remaining = delayStore;
			window.clearTimeout(timerId);
			timerId = window.setTimeout(callback, remaining);
		};

		this.resume();
	}

	function instance$3($$self, $$props, $$invalidate) {
		let activeStories = [];

		for (const project of projectArray) {
			activeStories.push(0);
		}

		let { params = { project: 0, story: 0 } } = $$props;
		let bufferProject = 0;
		let gesture_start,
			gesture_active,
			gesture_gap = 0;
		let held = false;
		let swipeDirection = 'right';
		let gestureTimedOut = true; //whether a gesture has timed out
		let gestureTimer; //timer object to time that
		let storyTimer; //timer object to time stories
		let navOpen = false;

		const showNav = function (event) {
			$$invalidate(5, (navOpen = event.detail.open));
			storyTimer.pause();
		};

		function handleNavProject(event) {
			pushHandler(event.detail, 0);
			storyTimer.resume();
		}

		function pushHandler(project, story) {
			//something in this router
			// console.log("pushHandler :" + project + ", " + story);
			push(`/${project.toString()}/${story.toString()}`);

			if (storyTimer) storyTimer.reset();
		}

		function handleProjects(direction) {
			if (direction == 'next') {
				pushHandler(next.project, next.story);
			} else if (direction == 'prev') {
				pushHandler(prev.project, prev.story);
			} else if (direction == 'nextProject') {
				pushHandler(nextProject, activeStories[nextProject]);
			} else if (direction == 'prevProject') {
				pushHandler(prevProject, activeStories[prevProject]);
			}
		}

		function gestureDown(e) {
			//when a gesture starts
			if (navOpen) {
				$$invalidate(5, (navOpen = false)); //close nav
				storyTimer.resume(); //pause story timer
			} else {
				storyTimer.pause(); //pause story timer

				// navOpen = false; //close nav
				$$invalidate(3, (held = true)); //start holding gesture

				gestureTimedOut = false; //reset gestureTimedOut, hasn't timed out yet

				e.type == 'touchstart'
					? (gesture_start = Math.round(e.changedTouches[0].pageX))
					: (gesture_start = e.pageX); //where the event starts

				gesture_active = gesture_start;

				gestureTimer = setTimeout(() => {
					gestureTimedOut = true; //start gesture timer
				}, 300);
			}
		}

		function gestureMove(e) {
			//when ya movin
			e.type == 'touchmove'
				? (gesture_active = Math.round(e.changedTouches[0].pageX))
				: (gesture_active = e.pageX);

			$$invalidate(2, (gesture_gap = gesture_active - gesture_start)); //set the gap between start and where you've dragged

			gesture_gap > 0
				? $$invalidate(4, (swipeDirection = 'left'))
				: $$invalidate(4, (swipeDirection = 'right'));
		}

		function gestureUp(e) {
			storyTimer.resume();

			if (!gestureTimedOut) {
				//if the gesture hasn't timed out
				if (gesture_active > gesture_start + swipeSensitivity) {
					handleProjects('prevProject');
				} else if (gesture_active < gesture_start - swipeSensitivity) {
					handleProjects('nextProject');
				} else {
					//JUST GO NEXT OR PREV
					if (Math.abs(gesture_gap) < 10) {
						gesture_active > window.innerWidth / 2
							? handleProjects('next')
							: handleProjects('prev');
					}
				}
			} else {
				//if the gesture has timed out
				if (gesture_active > gesture_start + 200) {
					handleProjects('prevProject');
				} else if (gesture_active < gesture_start - 200) {
					handleProjects('nextProject');
				}
			} //reset stuff

			// if (storyTimer) storyTimer.reset();
			if (gestureTimer) clearTimeout(gestureTimer);

			$$invalidate(3, (held = false)); //end holding gesture
			gesture_start = 0;
			gesture_active = 0;
			$$invalidate(2, (gesture_gap = 0));
		}

		function handleKeydown(e) {
			if (e.keyCode == 39 || e.keyCode == 32 || e.keyCode == 68) {
				handleProjects('next');
			} else if (e.keyCode == 37 || e.keyCode == 8 || e.keyCode == 65) {
				handleProjects('prev');
			}
		}

		onMount(() => {
			//when first mounts; basically on page load
			storyTimer = new Timer(() => {
				handleProjects('next');
			}, storyTimerTime);

			function callback(e) {
				var e = window.e || e;
				if (e.target.tagName !== 'A') return;

				// Do something
				window.location.href = e.srcElement.href; //go to link
			}

			if (document.addEventListener) document.addEventListener('touchend', callback, false);
			else document.attachEvent('onclick', callback);
		});

		onDestroy(() => {
			storyTimer.clear();
			storyTimer = null;
		});

		const writable_props = ['params'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$')
				console.warn(`<Stories> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots('Stories', $$slots, []);

		const mousedown_handler = (e) => {
			gestureDown(e);
		};

		const mousemove_handler = (e) => {
			if (held) gestureMove(e);
		};

		const mouseup_handler = (e) => {
			if (held) gestureUp();
		};

		const touchstart_handler = (e) => {
			gestureDown(e);
		};

		const touchmove_handler = (e) => {
			if (held) gestureMove(e);
		};

		const touchend_handler = (e) => {
			if (held) gestureUp();
		};

		$$self.$set = ($$props) => {
			if ('params' in $$props) $$invalidate(0, (params = $$props.params));
		};

		$$self.$capture_state = () => ({
			Story,
			onMount,
			onDestroy,
			Nav,
			projectArray,
			getNext,
			getPrev,
			push,
			activeStories,
			params,
			bufferProject,
			gesture_start,
			gesture_active,
			gesture_gap,
			held,
			swipeDirection,
			swipeSensitivity,
			gestureTimedOut,
			gestureTimer,
			storyTimer,
			storyTimerTime,
			navOpen,
			showNav,
			Timer,
			handleNavProject,
			pushHandler,
			handleProjects,
			gestureDown,
			gestureMove,
			gestureUp,
			handleKeydown,
			next,
			prev,
			nextProject,
			prevProject,
		});

		$$self.$inject_state = ($$props) => {
			if ('activeStories' in $$props) $$invalidate(1, (activeStories = $$props.activeStories));
			if ('params' in $$props) $$invalidate(0, (params = $$props.params));
			if ('bufferProject' in $$props) $$invalidate(16, (bufferProject = $$props.bufferProject));
			if ('gesture_start' in $$props) gesture_start = $$props.gesture_start;
			if ('gesture_active' in $$props) gesture_active = $$props.gesture_active;
			if ('gesture_gap' in $$props) $$invalidate(2, (gesture_gap = $$props.gesture_gap));
			if ('held' in $$props) $$invalidate(3, (held = $$props.held));
			if ('swipeDirection' in $$props) $$invalidate(4, (swipeDirection = $$props.swipeDirection));
			if ('gestureTimedOut' in $$props) gestureTimedOut = $$props.gestureTimedOut;
			if ('gestureTimer' in $$props) gestureTimer = $$props.gestureTimer;
			if ('storyTimer' in $$props) storyTimer = $$props.storyTimer;
			if ('navOpen' in $$props) $$invalidate(5, (navOpen = $$props.navOpen));
			if ('next' in $$props) $$invalidate(6, (next = $$props.next));
			if ('prev' in $$props) $$invalidate(7, (prev = $$props.prev));
			if ('nextProject' in $$props) $$invalidate(8, (nextProject = $$props.nextProject));
			if ('prevProject' in $$props) $$invalidate(9, (prevProject = $$props.prevProject));
		};

		let next;
		let prev;
		let nextProject;
		let prevProject;

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*params*/ 1) {
				//when params change, update activeStories
				$$invalidate(
					1,
					(activeStories[parseInt(params.project)] = parseInt(params.story)),
					activeStories
				);
			}

			if ($$self.$$.dirty[0] & /*params*/ 1) {
				$$invalidate(6, (next = getNext(params)));
			}

			if ($$self.$$.dirty[0] & /*params*/ 1) {
				$$invalidate(7, (prev = getPrev(params)));
			}

			if ($$self.$$.dirty[0] & /*params*/ 1) {
				$$invalidate(
					8,
					(nextProject =
						parseInt(params.project) < projectArray.length - 1 ? parseInt(params.project) + 1 : 0)
				);
			}

			if ($$self.$$.dirty[0] & /*params*/ 1) {
				$$invalidate(
					9,
					(prevProject =
						parseInt(params.project) > 0 ? parseInt(params.project) - 1 : projectArray.length - 1)
				);
			}

			if ($$self.$$.dirty[0] & /*params, bufferProject*/ 65537) {
				//if the project has changed since router push went through
				if (parseInt(params.project) != bufferProject) {
					if (parseInt(params.project) == 0) {
						bufferProject == projectArray.length - 1
							? $$invalidate(4, (swipeDirection = 'left'))
							: $$invalidate(4, (swipeDirection = 'right'));
					} else if (parseInt(params.project) == projectArray.length - 1) {
						bufferProject == 0
							? $$invalidate(4, (swipeDirection = 'right'))
							: $$invalidate(4, (swipeDirection = 'left'));
					} else {
						parseInt(params.project) > bufferProject
							? $$invalidate(4, (swipeDirection = 'left'))
							: $$invalidate(4, (swipeDirection = 'right'));
					}

					$$invalidate(16, (bufferProject = parseInt(params.project)));
				}
			}
		};

		return [
			params,
			activeStories,
			gesture_gap,
			held,
			swipeDirection,
			navOpen,
			next,
			prev,
			nextProject,
			prevProject,
			showNav,
			handleNavProject,
			gestureDown,
			gestureMove,
			gestureUp,
			handleKeydown,
			bufferProject,
			gesture_start,
			gesture_active,
			gestureTimedOut,
			gestureTimer,
			storyTimer,
			pushHandler,
			handleProjects,
			mousedown_handler,
			mousemove_handler,
			mouseup_handler,
			touchstart_handler,
			touchmove_handler,
			touchend_handler,
		];
	}

	class Stories extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, not_equal, { params: 0 }, [-1, -1]);

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Stories',
				options,
				id: create_fragment$3.name,
			});
		}

		get params() {
			throw new Error(
				"<Stories>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set params(value) {
			throw new Error(
				"<Stories>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}
	}

	const routes = {
		'/': Stories,
		'/:project/:story': Stories,
		'*': Stories,
	};

	/* src/App.svelte generated by Svelte v3.20.1 */

	function create_fragment$4(ctx) {
		let current;
		const router = new Router({ props: { routes }, $$inline: true });
		router.$on('routeLoaded', routeLoaded);

		const block = {
			c: function create() {
				create_component(router.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option'
				);
			},
			m: function mount(target, anchor) {
				mount_component(router, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(router.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(router.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(router, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$4.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function routeLoaded(event) {
		// console.log("routeLoaded");
		let loadedRoute = event.detail.location.split('/'); //route

		loadedRoute.shift(); //delete first item

		if (loadedRoute[0]) {
			//if there's even a value there
			if (Number.isInteger(parseInt(loadedRoute[0]))) {
				//if it's a number
				if (
					//if first number is out of range
					parseInt(loadedRoute[0]) >= projectArray.length ||
					parseInt(loadedRoute[0]) < 0
				) {
					replace('/');
				} else {
					//if the first number is in range
					if (loadedRoute.length == 2) {
						//if there's a second value
						if (Number.isInteger(parseInt(loadedRoute[1]))) {
							//& it's a number
							if (
								parseInt(loadedRoute[1]) >= projectArray[parseInt(loadedRoute[0])].stories.length
							) {
								// if it's higher than the amount of stories in that project
								replace('/' + loadedRoute[0] + '/0');
							}
						} else {
							//if second value is not a number
							replace('/' + loadedRoute[0] + '/0');
						}
					} else if ((loadedRoute.length = 1)) {
						//if there's only the first number
						replace('/' + loadedRoute[0] + '/0');
					}
				}
			} else {
				//if first value is not even a number
				replace('/'); //BAIL
			}
		} else {
			replace('/0/0');
		}
	}

	function instance$4($$self, $$props, $$invalidate) {
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$')
				console.warn(`<App> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots('App', $$slots, []);

		$$self.$capture_state = () => ({
			Router,
			projectArray,
			replace,
			routes,
			routeLoaded,
		});

		return [];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'App',
				options,
				id: create_fragment$4.name,
			});
		}
	}

	const app = new App({
		target: document.body,
	});

	return app;
})();
//# sourceMappingURL=bundle.js.map
