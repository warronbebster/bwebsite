<<<<<<< HEAD

(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
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
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
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
            if (iterations[i])
                iterations[i].d(detaching);
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
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
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
                callbacks.slice().forEach(fn => {
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
            callbacks.slice().forEach(fn => fn(event));
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
        if (flushing)
            return;
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
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
            p: outros // parent group
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
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
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
            }
            else {
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
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
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
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
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
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
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
        $capture_state() { }
        $inject_state() { }
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
                if (stop) { // store is ready
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
        const stores_array = single
            ? [stores]
            : stores;
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
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
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
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
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
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(219:0) {:else}",
    		ctx
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
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
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
    			if (dirty & /*componentParams*/ 2) switch_instance_changes.params = /*componentParams*/ ctx[1];

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
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(217:0) {#if componentParams}",
    		ctx
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
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(route, userData, ...conditions) {
    	// Check if we don't have userData
    	if (userData && typeof userData == "function") {
    		conditions = conditions && conditions.length ? conditions : [];
    		conditions.unshift(userData);
    		userData = undefined;
    	}

    	// Parameter route and each item of conditions must be functions
    	if (!route || typeof route != "function") {
    		throw Error("Invalid parameter route");
    	}

    	if (conditions && conditions.length) {
    		for (let i = 0; i < conditions.length; i++) {
    			if (!conditions[i] || typeof conditions[i] != "function") {
    				throw Error("Invalid parameter conditions[" + i + "]");
    			}
    		}
    	}

    	// Returns an object that contains all the functions to execute too
    	const obj = { route, userData };

    	if (conditions && conditions.length) {
    		obj.conditions = conditions;
    	}

    	// The _sveltesparouter flag is to confirm the object was created by this router
    	Object.defineProperty(obj, "_sveltesparouter", { value: true });

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
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return tick().then(() => {
    		window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    	});
    }

    function pop() {
    	// Execute this code when the current call stack is complete
    	return tick().then(() => {
    		window.history.back();
    	});
    }

    function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return tick().then(() => {
    		const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    		try {
    			window.history.replaceState(undefined, undefined, dest);
    		} catch(e) {
    			// eslint-disable-next-line no-console
    			console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    		}

    		// The method above doesn't trigger the hashchange event, so let's do that manually
    		window.dispatchEvent(new Event("hashchange"));
    	});
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute");
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);
    }

    function nextTickPromise(cb) {
    	// eslint-disable-next-line no-console
    	console.warn("nextTickPromise from 'svelte-spa-router' is deprecated and will be removed in version 3; use the 'tick' method from the Svelte runtime instead");

    	return tick().then(cb);
    }

    function instance($$self, $$props, $$invalidate) {
    	let $loc,
    		$$unsubscribe_loc = noop;

    	validate_store(loc, "loc");
    	component_subscribe($$self, loc, $$value => $$invalidate(4, $loc = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_loc());
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;

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
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
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
    				path = path.substr(prefix.length) || "/";
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
    		Object.keys(routes).forEach(path => {
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

    	const writable_props = ["routes", "prefix"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
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
    		$loc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*component, $loc*/ 17) {
    			// Handle hash change events
    			// Listen to changes in the $loc store and update the page
    			 {
    				// Find a route matching the location
    				$$invalidate(0, component = null);

    				let i = 0;

    				while (!component && i < routesList.length) {
    					const match = routesList[i].match($loc.location);

    					if (match) {
    						const detail = {
    							component: routesList[i].component,
    							name: routesList[i].component.name,
    							location: $loc.location,
    							querystring: $loc.querystring,
    							userData: routesList[i].userData
    						};

    						// Check if the route can be loaded - if all conditions succeed
    						if (!routesList[i].checkConditions(detail)) {
    							// Trigger an event to notify the user
    							dispatchNextTick("conditionsFailed", detail);

    							break;
    						}

    						$$invalidate(0, component = routesList[i].component);

    						// Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    						// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    						if (match && typeof match == "object" && Object.keys(match).length) {
    							$$invalidate(1, componentParams = match);
    						} else {
    							$$invalidate(1, componentParams = null);
    						}

    						dispatchNextTick("routeLoaded", detail);
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
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { routes: 2, prefix: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const figmaProject = [{ name: "Hello", stories:['<section class="frame" style="overflow: hidden; background-image: url(./images/!intro); background-size: cover;  width:100%; height:100%; display:block;" ><div id="495:31" style="transform: matrix(0.9836799502372742,-0.17992709577083588,0.17992709577083588,0.9836799502372742,0,0); transform-origin: 0% 0%; position: absolute; left: 40.658447265625px; bottom: 117.63330078125px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="495:32" style="position: static; left: calc(50% - 92px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">You can also use arrow keys.</span></div></div><div id="578:25" style="transform: matrix(0.973799467086792,0.2274085283279419,-0.2274085283279419,0.973799467086792,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 133.6175994873047px - -57.62358093261719px); top: calc(50% - 22px - -33px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I578:25;495:30" style="width: 255.23519897460938px; position: static; left: calc(50% - 127.61759948730469px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">It works like instagram stories. Tap left or right, and swipe to skip chapters.</span></div></div><div id="579:44" style="transform: matrix(0.9876883625984192,-0.15643446147441864,0.15643446147441864,0.9876883625984192,0,0); transform-origin: 0% 0%; width: 348.8829345703125px; position: absolute; left: calc(50% - 174.44146728515625px - 6.55853271484375px); top: 106.57731628417969px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I579:44;495:30" style="width: 336.8829345703125px; position: static; left: calc(50% - 168.44146728515625px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Hi, I’m Barron. Welcome to my website :)</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(246, 207, 178, 1) 100%);  width:100%; height:100%; display:block;" ><div id="544:1" style="transform: matrix(0.9964331984519958,-0.08438510447740555,0.08438510447740555,0.9964331984519958,0,0); transform-origin: 0% 0%; width: 327.478515625px; position: absolute; left: calc(50% - 163.7392578125px - 19.575170516967773px); height: 271.1796875px; top: 270.49700927734375px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; overflow: hidden; "><div id="294:0" style="width: 327.478515625px; position: static; right: 0px; height: 247.1796875px; top: 0px; flex: none; align-self: stretch; flex-grow: 1; margin-bottom: 6px; background-image: url(./images/no_spaces); background-size: cover; box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "></div><div id="544:0" style="position: static; right: 177.478515625px; height: 18px; top: 253.1796875px; flex: none; flex-grow: 0; opacity: 0.699999988079071; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">FIG 1. me and software</span></div></div><div id="543:55" style="transform: matrix(0.9909805655479431,0.13400520384311676,-0.13400520384311676,0.9909805655479431,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 168px - -1.6786079406738281px); top: 70px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="593:0" style="position: static; right: 0px; top: calc(50% - 22px - 36.5px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 11px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I593:0;578:15" style="position: static; left: calc(50% - 162px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">I mostly design software.</span></div></div><div id="601:0" style="width: 218.92893981933594px; position: static; left: calc(50% - 109.46446990966797px - 58.535543286126085px); top: calc(50% - 31px - -27.50000762939453px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I601:0;495:30" style="width: 206.92893981933594px; position: static; left: calc(50% - 103.46446990966797px - 0px); height: 54px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Primarily zero-to-one launches for new services, focusing on emerging technology.</span></div></div></div><div id="1208:43" style="transform: matrix(0.9909805655479431,0.13400520384311676,-0.13400520384311676,0.9909805655479431,0,0); transform-origin: 0% 0%; width: 193.85501098632812px; position: absolute; right: 23.248764038085938px; bottom: 139px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:43;495:30" style="width: 181.85501098632812px; position: static; left: calc(50% - 90.92750549316406px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Sometimes I even write the software. Like this website!</span></div></div></section>','<section class="frame" style="overflow: hidden; background-image: url(./images/!city); background-size: cover;  width:100%; height:100%; display:block;" ><div id="1208:19" style="z-index: 21; transform: matrix(0.9937077760696411,-0.11200381815433502,0.11200381815433502,0.9937077760696411,0,0); transform-origin: 0% 0%; position: absolute; left: 24.10540771484375px; bottom: 135.29022216796875px; display: flex; flex-direction: row; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-end; "><div id="1208:20" style="position: static; left: 0px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:20;578:15" style="position: static; left: calc(50% - 16.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://risd.gd">RISD</a></span></div></div><div id="1208:21" style="position: static; left: 53px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:21;578:15" style="position: static; left: calc(50% - 36px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://upperquad.com/">Upperquad</a></span></div></div><div id="1208:22" style="position: static; left: 145px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:22;578:15" style="position: static; left: calc(50% - 35.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://metahaven.net/">Metahaven</a></span></div></div><div id="1208:23" style="position: static; left: 236px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:23;578:15" style="position: static; left: calc(50% - 41.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://maps.google.com/">Google Maps</a></span></div></div></div><div id="1208:27" style="transform: matrix(0.9911307096481323,-0.13289108872413635,0.13289108872413635,0.9911307096481323,0,0); transform-origin: 0% 0%; width: 286.0762023925781px; position: absolute; left: calc(50% - 143.03810119628906px - 35.96189880371094px); top: 92.81344604492188px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:27;495:30" style="width: 274.0762023925781px; position: static; left: calc(50% - 137.03810119628906px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I currently work @ google’s creative lab.</span></div></div><div id="1208:28" style="transform: matrix(0.9937077760696411,-0.11200381815433502,0.11200381815433502,0.9937077760696411,0,0); transform-origin: 0% 0%; position: absolute; left: 19.06524658203125px; bottom: 175.007080078125px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:28;578:15" style="position: static; left: calc(50% - 114.5px - 0px); height: 23px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">Before that, I spent time at:</span></div></div><div id="1865:72" style="transform: matrix(0.9849564433097839,0.17280274629592896,-0.17280274629592896,0.9849564433097839,0,0); transform-origin: 0% 0%; position: absolute; right: 20.64306640625px; top: 183px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1865:72;578:15" style="position: static; left: calc(50% - 124px - 0px); height: 23px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">this is the view from the office</span></div></div></section>','<section class="frame" style="overflow: hidden; background-image: url(./images/!talk); background-size: cover; border-radius: 2px 2px 2px 2px;  width:100%; height:100%; display:block;" ><div id="761:54" style="z-index: 21; transform: matrix(0.9921972155570984,-0.12467850744724274,0.12467850744724274,0.9921972155570984,0,0); transform-origin: 0% 0%; position: absolute; left: 13.8582763671875px; bottom: 116.57989501953125px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="555:35" style="position: static; left: 0px; bottom: 32px; display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I555:35;578:15" style="position: static; left: calc(50% - 175px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">and teach software/design.</span></div></div><div id="555:40" style="position: static; left: 0px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I555:40;578:15" style="position: static; left: calc(50% - 75.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.notion.so/Design-in-the-Real-World-ac2a96893f034b85b1045025054009ce">Interaction design, SVA</a></span></div></div></div><div id="761:49" style="z-index: 21; transform: matrix(0.982860267162323,-0.18435218930244446,0.18435218930244446,0.982860267162323,0,0); transform-origin: 0% 0%; position: absolute; left: 17.87548828125px; top: 79.26504516601562px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="761:52" style="position: static; left: 0px; top: 0px; display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:52;578:15" style="position: static; left: calc(50% - 150px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">I also occasionally talk,</span></div></div><div id="1208:40" style="position: static; left: 0px; top: 50px; display: flex; flex-direction: row; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; flex: none; flex-grow: 0; "><div id="761:41" style="transform: matrix(1.0000001192092896,5.725459217842399e-9,-5.725459217842399e-9,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 0.00005506980960490182px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:41;578:15" style="position: static; left: calc(50% - 43px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.itsnicethat.com/articles/wix-playground-presents-data-narrative-design-round-up-digital-event-040320">It’s Nice That</a></span></div></div><div id="761:43" style="transform: matrix(1.0000001192092896,5.725459217842399e-9,-5.725459217842399e-9,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 104.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:43;578:15" style="position: static; left: calc(50% - 18px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://design.google/library/span2019/">SPAN</a></span></div></div><div id="761:44" style="position: static; left: 158.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:44;578:15" style="position: static; left: calc(50% - 15.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://thefwa.com/interviews/barron-webster">FWA</a></span></div></div><div id="761:42" style="position: static; left: 207.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:42;578:15" style="position: static; left: calc(50% - 13px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://web.mit.edu/">MIT</a></span></div></div></div></div><div id="761:38" style="z-index: 21; transform: matrix(0.9788978695869446,0.20434996485710144,-0.20434996485710144,0.9788978695869446,0,0); transform-origin: 0% 0%; position: absolute; right: 6.3427734375px; top: calc(50% - 70px - 20.264984130859375px); display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="761:39" style="position: static; right: 14px; top: calc(50% - 22px - 48px); display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:39;578:15" style="position: static; left: calc(50% - 37px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">write,</span></div></div><div id="761:33" style="position: static; right: 0px; top: calc(50% - 13px - 7px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:33;578:15" style="position: static; left: calc(50% - 46px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://design.google/library/designing-and-learning-teachable-machine/">Google Design</a></span></div></div><div id="761:34" style="transform: matrix(1.0000001192092896,-5.551115123125783e-17,5.551115123125783e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 0px; top: 82px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:34;578:15" style="position: static; left: calc(50% - 43px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.itsnicethat.com/news/pay-interns-why-it-matters-barron-webster-opinion-180918">It’s Nice That</a></span></div></div><div id="761:32" style="position: static; right: 40px; top: calc(50% - 13px - -57px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:32;578:15" style="position: static; left: calc(50% - 26px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://medium.com/@warronbebster/the-future-of-augmented-reality-will-be-boring-fc95be238ef4">Medium</a></span></div></div></div></section>',]}, { name: "Work", stories:['<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1796:57" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 337.9999694824219px; position: absolute; left: calc(50% - 168.99998474121094px - 0.0000152587890625px); top: 43px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1796:57;495:30" style="width: 325.9999694824219px; position: static; left: calc(50% - 162.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; color: rgba(0, 0, 0, 1); " key="47">for the past year i’ve been leading design for </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; color: rgba(0, 0, 0, 1); " key="57"> <a href="https://restor.eco/">Restor.eco</a></span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; color: rgba(0, 0, 0, 1); " key="end">:</span></div></div><div id="1820:0" style="transform: matrix(0.9902680516242981,0.13917310535907745,-0.13917310535907745,0.9902680516242981,0,0); transform-origin: 0% 0%; width: 436.388427734375px; position: absolute; left: calc(50% - 218.1942138671875px - -21.531173706054688px); height: 266.3000183105469px; top: calc(50% - 133.15000915527344px - 28.849990844726562px); background-image: url(./images/Site); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1797:2" style="transform: matrix(0.9902680516242981,0.13917310535907745,-0.13917310535907745,0.9902680516242981,0,0); transform-origin: 0% 0%; width: 436.388427734375px; position: absolute; left: calc(50% - 218.1942138671875px - -21.53116798400879px); height: 266.3000183105469px; top: calc(50% - 133.15000915527344px - 28.849990844726562px); opacity: 0.5; background-image: url(./images/Site); background-size: cover; border-radius: 4px 4px 4px 4px; "></div><div id="1797:4" style="transform: matrix(0.9902680516242981,0.13917310535907745,-0.13917310535907745,0.9902680516242981,0,0); transform-origin: 0% 0%; width: 282.9093322753906px; position: absolute; right: 2.0665435791015625px; height: 791.1173706054688px; top: 57px; background-image: url(./images/insight_crop); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 8px 8px 8px 8px; "></div><div id="1797:5" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 229.99996948242188px; position: absolute; left: 12px; top: 43px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1797:5;495:30" style="width: 217.99996948242188px; position: static; left: calc(50% - 108.99998474121094px - 0px); height: 69px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">It’s an open data platform tailored for the global restoration movement. </span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1197:3" style="transform: matrix(0.9942448139190674,0.10713174939155579,-0.10713174939155579,0.9942448139190674,0,0); transform-origin: 0% 0%; width: 351.2443542480469px; position: absolute; left: calc(50% - 175.62217712402344px - -5.6975555419921875px); height: 196.723876953125px; top: calc(50% - 98.3619384765625px - -129.3619384765625px); background-image: url(./images/TM_screenshot_2); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="1197:14" style="transform: matrix(0.9942525029182434,0.1070602536201477,-0.1070602536201477,0.9942525029182434,0,0); transform-origin: 0% 0%; width: 413.2357482910156px; position: absolute; left: calc(50% - 206.6178741455078px - -12.703231811523438px); height: 185.33255004882812px; top: calc(50% - 92.66627502441406px - 166.64756774902344px); background-image: url(./images/what); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="1197:4" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 255.99996948242188px; position: absolute; left: calc(50% - 127.99998474121094px - 0.0000152587890625px); top: calc(50% - 27px - 3.5px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1197:4;495:30" style="width: 243.99996948242188px; position: static; left: calc(50% - 121.99998474121094px - 0px); height: 46px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">It’s a web tool for training AI models, no coding required.</span></div></div><div id="1197:15" style="z-index: 21; transform: matrix(0.9942449331283569,0.10713176429271698,-0.10713176429271698,0.9942449331283569,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 120px - -2px); top: calc(50% - 13px - -255px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; opacity: 0.6000000238418579; overflow: hidden; border-radius: 4px 4px 4px 4px; "><div id="I1197:15;578:15" style="position: static; left: calc(50% - 114px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://twitter.com/search?q=%23teachablemachine&f=live">See what people have made with it.</a></span></div></div><div id="1197:12" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 282.9999694824219px; position: absolute; left: calc(50% - 141.49998474121094px - -0.4999847412109375px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1197:12;495:30" style="width: 270.9999694824219px; position: static; left: calc(50% - 135.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="13">Before that, </span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="30">I led design for </span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="47"> <a href="https://teachablemachine.withgoogle.com/">Teachable Machine</a></span><span key="end">:</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1201:6" style="transform: matrix(0.9942448139190674,-0.10713174939155579,0.10713174939155579,0.9942448139190674,0,0); transform-origin: 0% 0%; width: 655.7010498046875px; position: absolute; left: calc(50% - 327.85052490234375px - 61.14947509765625px); height: 515.0559692382812px; top: calc(50% - 257.5279846191406px - -62.774383544921875px); background-image: url(./images/lens_IO); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 2px 2px 2px 2px; "></div><div id="1201:9" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 233.99996948242188px; position: absolute; left: calc(50% - 116.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:9;495:30" style="width: 221.99996948242188px; position: static; left: calc(50% - 110.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="25">I helped design & launch </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="end"> <a href="https://lens.google.com/">Google Lens:</a></span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="705:2" style="transform: matrix(0.9957780838012695,-0.09179326146841049,0.09179326146841049,0.9957780838012695,0,0); transform-origin: 0% 0%; width: 309.90411376953125px; position: absolute; right: -8.42864990234375px; height: 169.4788055419922px; bottom: 64.63725280761719px; background-image: url(./images/payinterns); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="705:3" style="transform: matrix(0.9971057772636414,0.07602643966674805,-0.07602643966674805,0.9971057772636414,0,0); transform-origin: 0% 0%; width: 320.6974182128906px; position: absolute; left: -26.869298934936523px; height: 172.5336151123047px; top: calc(50% - 86.26680755615234px - 4.901344299316406px); background-image: url(./images/welcomeback); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="705:4" style="transform: matrix(0.9889853000640869,-0.14801350235939026,0.14801350235939026,0.9889853000640869,0,0); transform-origin: 0% 0%; width: 284.3169250488281px; position: absolute; right: -7.135589599609375px; height: 176.09259033203125px; top: 99.38426208496094px; background-image: url(./images/vote_screenshot); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="705:6" style="z-index: 21; transform: matrix(0.9889854192733765,-0.14801351726055145,0.14801351726055145,0.9889854192733765,0,0); transform-origin: 0% 0%; width: 187.62852478027344px; position: absolute; right: 127.0031967163086px; top: 230.17840576171875px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:6;495:30" style="width: 175.62852478027344px; position: static; left: calc(50% - 87.81426239013672px - 0px); height: 18px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://techcrunch.com/2018/11/06/googles-doodle-commands-you-to-go-vote/">Google’s first voting doodle</a></span></div></div><div id="705:7" style="z-index: 21; transform: matrix(0.9957782030105591,-0.09179326891899109,0.09179326891899109,0.9957782030105591,0,0); transform-origin: 0% 0%; width: 201.4622344970703px; position: absolute; right: 109.00833892822266px; bottom: 92.9647216796875px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:7;495:30" style="width: 189.4622344970703px; position: static; left: calc(50% - 94.73111724853516px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://payinterns.nyc">A list of NYC offices that pay creative interns a living wage</a></span></div></div><div id="705:9" style="z-index: 21; transform: matrix(0.9971058964729309,0.07602645456790924,-0.07602645456790924,0.9971058964729309,0,0); transform-origin: 0% 0%; width: 192.53700256347656px; position: absolute; left: 114.38227844238281px; top: calc(50% - 23px - -31.126953125px); display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:9;495:30" style="width: 180.53700256347656px; position: static; left: calc(50% - 90.26850128173828px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://welcomeback.nyc">A web store where only one person can shop at a time</a></span></div></div><div id="1201:16" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 57.5px - 0.5000152587890625px); top: 33px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:16;578:15" style="position: static; left: calc(50% - 51.5px - 0px); height: 31px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And also:</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="709:3" style="transform: matrix(0.9971598386764526,0.07531432807445526,-0.07531432807445526,0.9971598386764526,0,0); transform-origin: 0% 0%; width: 350.08770751953125px; position: absolute; left: -59.18896484375px; height: 183.3792724609375px; bottom: 80.820556640625px; background-image: url(./images/covid); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="709:2" style="transform: matrix(0.9985552430152893,-0.053734373301267624,0.053734373301267624,0.9985552430152893,0,0); transform-origin: 0% 0%; width: 328.3610534667969px; position: absolute; right: -6.607513427734375px; height: 167.78306579589844px; top: calc(50% - 83.89153289794922px - -13.760948181152344px); background-image: url(./images/enhance); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="704:0" style="transform: matrix(0.9946823120117188,0.10299064218997955,-0.10299064218997955,0.9946823120117188,0,0); transform-origin: 0% 0%; width: 240.78590393066406px; position: absolute; left: -10.297911643981934px; height: 192.90232849121094px; top: 67.86387634277344px; background-image: url(./images/lens2); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="721:0" style="transform: matrix(0.9946824312210083,0.10299064964056015,-0.10299064964056015,0.9946824312210083,0,0); transform-origin: 0% 0%; width: 188.84039306640625px; position: absolute; left: 110.73759460449219px; top: 199px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:0;495:30" style="width: 176.84039306640625px; position: static; left: calc(50% - 88.42019653320312px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end">Prototyping the first Google Home devices w/ screens</span></div></div><div id="721:3" style="z-index: 21; transform: matrix(0.9985553622245789,-0.05373437702655792,0.05373437702655792,0.9985553622245789,0,0); transform-origin: 0% 0%; position: absolute; right: 125.10746765136719px; top: calc(50% - 14px - -60.414093017578125px); display: flex; flex-direction: row; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:3;578:15" style="position: static; left: calc(50% - 109.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://enhance.computer">A cyberpunk detective voice game</a></span></div></div><div id="721:5" style="z-index: 21; transform: matrix(0.9971599578857422,0.07531433552503586,-0.07531433552503586,0.9971599578857422,0,0); transform-origin: 0% 0%; width: 178.79794311523438px; position: absolute; left: 145.4644775390625px; bottom: 89.99432373046875px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:5;495:30" style="width: 166.79794311523438px; position: static; left: calc(50% - 83.39897155761719px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://google.com/covid19/mobility/">Global mobility reports for understanding COVID</a></span></div></div><div id="1201:19" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 32px - 0.5px); top: 33px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:19;578:15" style="position: static; left: calc(50% - 26px - 0px); height: 31px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And:</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1201:0" style="transform: matrix(0.9540171027183533,0.2997521460056305,-0.2997521460056305,0.9540171027183533,0,0); transform-origin: 0% 0%; width: 388.14288330078125px; position: absolute; left: calc(50% - 194.07144165039062px - 85.75747680664062px); height: 389.6709899902344px; top: -40.45792770385742px; background-image: url(./images/BeyBlade); background-size: cover; "></div><div id="1201:13" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 231.99996948242188px; position: absolute; left: calc(50% - 115.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:13;495:30" style="width: 219.99996948242188px; position: static; left: calc(50% - 109.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I also used to make dumb t-shirts:</span></div></div><div id="1201:2" style="transform: matrix(0.8501306772232056,0.5265717506408691,-0.5265717506408691,0.8501306772232056,0,0); transform-origin: 0% 0%; width: 434.91143798828125px; position: absolute; left: calc(50% - 217.45571899414062px - -10.341907307505608px); height: 436.5714416503906px; top: 338px; background-image: url(./images/Infinitywar); background-size: cover; "></div><div id="1201:1" style="transform: matrix(0.9515489339828491,-0.30749738216400146,0.30749738216400146,0.9515489339828491,0,0); transform-origin: 0% 0%; width: 410.4928894042969px; position: absolute; left: calc(50% - 205.24644470214844px - -114.24644470214844px); height: 410.4928894042969px; top: 275.282958984375px; background-image: url(./images/Grimes); background-size: cover; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1865:80" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 231.99996948242188px; position: absolute; left: calc(50% - 115.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1865:80;495:30" style="width: 219.99996948242188px; position: static; left: calc(50% - 109.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I’ve designed some book covers:</span></div></div><div id="1865:85" style="transform: matrix(0.9825518727302551,-0.1859886199235916,0.1859886199235916,0.9825518727302551,0,0); transform-origin: 0% 0%; width: 379.10052490234375px; position: absolute; left: calc(50% - 189.55026245117188px - 37.449737548828125px); height: 438.7815246582031px; top: calc(50% - 219.39076232910156px - -39.39076232910156px); background-image: url(./images/stack_smol); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1865:87" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 231.99996948242188px; position: absolute; left: calc(50% - 115.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1865:87;495:30" style="width: 219.99996948242188px; position: static; left: calc(50% - 109.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Even some book cover systems:</span></div></div><div id="1865:90" style="transform: matrix(0.9882276058197021,0.1529906541109085,-0.1529906541109085,0.9882276058197021,0,0); transform-origin: 0% 0%; width: 416.0060729980469px; position: absolute; left: calc(50% - 208.00303649902344px - -31.002933502197266px); height: 373.7554626464844px; top: calc(50% - 186.8777313232422px - 30.122268676757812px); background-image: url(./images/cosmos_anniversary_smol_1); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1866:9" style="transform: matrix(0.9741045832633972,0.2260979861021042,-0.2260979861021042,0.9741045832633972,0,0); transform-origin: 0% 0%; width: 407px; position: absolute; left: -11.7275390625px; height: 271px; top: -13px; background-image: url(./images/documentation22314); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="1866:5" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 257.9999694824219px; position: absolute; left: calc(50% - 128.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1866:5;495:30" style="width: 245.99996948242188px; position: static; left: calc(50% - 122.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And occasionally the inside of some books</span></div></div><div id="1866:13" style="transform: matrix(0.9901300072669983,-0.1401517689228058,0.1401517689228058,0.9901300072669983,0,0); transform-origin: 0% 0%; width: 399px; position: absolute; left: calc(50% - 199.5px - 16.5px); height: 266px; top: calc(50% - 133px - -69.92056274414062px); background-image: url(./images/documentation25924); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="1866:10" style="transform: matrix(0.9659258127212524,0.258819043636322,-0.258819043636322,0.9659258127212524,0,0); transform-origin: 0% 0%; width: 390.5374755859375px; position: absolute; right: -91.8284912109375px; height: 259.9926452636719px; bottom: 10.007354736328125px; background-image: url(./images/documentation27428); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1866:23" style="width: 845px; position: absolute; left: 21px; height: 555px; bottom: -17px; background-image: url(./images/screenshot); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 8px 8px 8px 8px; "></div><div id="1866:17" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 248.99996948242188px; position: absolute; left: calc(50% - 124.49998474121094px - -0.4999847412109375px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1866:17;495:30" style="width: 236.99996948242188px; position: static; left: calc(50% - 118.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I also sold my digital privacy in 2015, lol</span></div></div><div id="1866:21" style="z-index: 21; transform: matrix(0.9943346977233887,-0.10629584640264511,0.10629584640264511,0.9943346977233887,0,0); transform-origin: 0% 0%; width: 248.99996948242188px; position: absolute; left: calc(50% - 124.49998474121094px - -36.49998474121094px); bottom: 283.53235626220703px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1866:21;495:30" style="width: 236.99996948242188px; position: static; left: calc(50% - 118.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="20"> <a href="http://buymyprivacy.com">You can still buy it</a></span><span key="end"> if you want, i think?</span></div></div></section>',]}, { name: "Thoughts", stories:['<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(178, 242, 246, 1) 0%, rgba(157, 186, 228, 1) 100%);  width:100%; height:100%; display:block;" ><div id="752:2" style="transform: matrix(0.9916291832923889,0.12911826372146606,-0.12911826372146606,0.9916291832923889,0,0); transform-origin: 0% 0%; width: 262.7255554199219px; position: absolute; left: -10.938142776489258px; height: 164.80056762695312px; top: 82.84492492675781px; background-image: url(./images/markets); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="752:3" style="transform: matrix(0.9980056881904602,0.06312429904937744,-0.06312429904937744,0.9980056881904602,0,0); transform-origin: 0% 0%; width: 272.24981689453125px; position: absolute; left: -16.914932250976562px; height: 175.60702514648438px; bottom: 68.48211669921875px; background-image: url(./images/cars); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="752:4" style="transform: matrix(0.9903979301452637,-0.13824567198753357,0.13824567198753357,0.9903979301452637,0,0); transform-origin: 0% 0%; width: 266.87841796875px; position: absolute; right: -36.905487060546875px; height: 161.26271057128906px; top: calc(50% - 80.63135528564453px - -24.52613067626953px); background-image: url(./images/infographic); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="752:5" style="transform: matrix(0.9916293025016785,0.12911827862262726,-0.12911827862262726,0.9916293025016785,0,0); transform-origin: 0% 0%; width: 217.27194213867188px; position: absolute; left: 74.89610290527344px; top: 203.74026489257812px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:5;495:30" style="width: 205.27194213867188px; position: static; left: calc(50% - 102.63597106933594px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Global accountability structures outside of financial markets</span></div></div><div id="752:6" style="transform: matrix(0.9980058073997498,0.06312430649995804,-0.06312430649995804,0.9980058073997498,0,0); transform-origin: 0% 0%; width: 193.99996948242188px; position: absolute; left: 127.7774658203125px; bottom: 90.00000381469727px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:6;495:30" style="width: 181.99996948242188px; position: static; left: calc(50% - 90.99998474121094px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Cities being planned around the infernal automobile</span></div></div><div id="752:7" style="transform: matrix(0.9903980493545532,-0.13824568688869476,0.13824568688869476,0.9903980493545532,0,0); transform-origin: 0% 0%; position: absolute; right: 137px; top: calc(50% - 13px - -79.17794799804688px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:7;578:15" style="position: static; left: calc(50% - 53px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Systems literacy</span></div></div><div id="752:8" style="width: 253px; position: absolute; left: calc(50% - 126.5px - 0.5px); top: 50px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:8;495:30" style="width: 241px; position: static; left: calc(50% - 120.5px - 0px); height: 46px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Here are some big problems I think need solving:</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-2.356194490192345rad, rgba(178, 242, 246, 1) 0%, rgba(157, 186, 228, 1) 100%);  width:100%; height:100%; display:block;" ><div id="799:47" style="transform: matrix(0.9915580153465271,0.12966495752334595,-0.12966495752334595,0.9915580153465271,0,0); transform-origin: 0% 0%; position: absolute; right: 10.62872314453125px; top: 158px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:47;578:15" style="position: static; left: calc(50% - 127px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(215, 255, 233, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Capital inheritance should be abolished</span></div></div><div id="800:11" style="transform: matrix(0.9875085949897766,-0.15756569802761078,0.15756569802761078,0.9875085949897766,0,0); transform-origin: 0% 0%; position: absolute; left: 39.96807861328125px; top: 132.56166076660156px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I800:11;578:15" style="position: static; left: calc(50% - 76px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 218, 221, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Meritocracy is a fantasy</span></div></div><div id="799:48" style="z-index: 21; transform: matrix(0.968247652053833,-0.24999360740184784,0.24999360740184784,0.968247652053833,0,0); transform-origin: 0% 0%; width: 267.3401184082031px; position: absolute; right: 12.660125732421875px; top: calc(50% - 31px - -16.917572021484375px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:48;495:30" style="width: 255.34011840820312px; position: static; left: calc(50% - 127.67005920410156px - 0px); height: 54px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(246, 209, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="87">Cars force cities to compromise community and livability. Subsidizing them the way the </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; color: rgba(246, 209, 255, 1); " key="96"> <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3345366">U.S. does</a></span><span key="end"> is abhorent</span></div></div><div id="800:13" style="transform: matrix(0.9980058073997498,0.06312430649995804,-0.06312430649995804,0.9980058073997498,0,0); transform-origin: 0% 0%; width: 191.3538055419922px; position: absolute; left: 15.049957275390625px; bottom: 232px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I800:13;495:30" style="width: 179.3538055419922px; position: static; left: calc(50% - 89.6769027709961px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(249, 214, 214, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Food, health, shelter and education are fundamental rights and markets can’t provide them to everyone</span></div></div><div id="801:2" style="transform: matrix(0.9943656921386719,-0.10600520670413971,0.10600520670413971,0.9943656921386719,0,0); transform-origin: 0% 0%; width: 254.84788513183594px; position: absolute; right: 26.608932495117188px; bottom: 72.98480224609375px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I801:2;495:30" style="width: 242.84788513183594px; position: static; left: calc(50% - 121.42394256591797px - 0px); height: 108px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(187, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Human intelligence is not exceptional; there are many other types of information organization  better at solving different problems. We are ripe with cognitive flaws and biases, especially at scale</span></div></div><div id="799:49" style="transform: matrix(0.9903980493545532,-0.13824568688869476,0.13824568688869476,0.9903980493545532,0,0); transform-origin: 0% 0%; width: 210.4332733154297px; position: absolute; left: 15px; top: calc(50% - 40px - 76.90852355957031px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:49;495:30" style="width: 198.4332733154297px; position: static; left: calc(50% - 99.21663665771484px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(220, 255, 207, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Traditional Westphalian nation-states are ill-equipped to solve modern problems. Borders should be abolished</span></div></div><div id="799:50" style="position: absolute; left: calc(50% - 112.5px - 0px); top: 50px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:50;578:15" style="position: static; left: calc(50% - 106.5px - 0px); height: 23px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And some current beliefs:</span></div></div><div id="808:1" style="transform: matrix(0.6923969388008118,-0.7215167880058289,0.7215167880058289,0.6923969388008118,0,0); transform-origin: 0% 0%; position: absolute; left: 244.82431030273438px; height: 54px; bottom: 209.21377563476562px; color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:2" style="transform: matrix(0.9943564534187317,-0.10609052330255508,0.10609052330255508,0.9943564534187317,0,0); transform-origin: 0% 0%; position: absolute; right: 293px; height: 42px; bottom: 90.544189453125px; color: rgba(0, 0, 0, 1); font-size: 42px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:3" style="transform: matrix(0.24094675481319427,-0.970538318157196,0.970538318157196,0.24094675481319427,0,0); transform-origin: 0% 0%; position: absolute; left: 236.34732055664062px; height: 44px; top: calc(50% - 22px - 70.948974609375px); color: rgba(0, 0, 0, 1); font-size: 44px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:5" style="transform: matrix(0.9861655235290527,0.16576355695724487,-0.16576355695724487,0.9861655235290527,0,0); transform-origin: 0% 0%; position: absolute; right: 305.3640441894531px; height: 34px; top: calc(50% - 17px - -8px); color: rgba(0, 0, 0, 1); font-size: 34px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:4" style="transform: matrix(0.9844132661819458,0.1758708953857422,-0.1758708953857422,0.9844132661819458,0,0); transform-origin: 0% 0%; position: absolute; right: 142.789306640625px; height: 41px; top: 97px; color: rgba(0, 0, 0, 1); font-size: 41px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-2.356194490192345rad, rgba(178, 242, 246, 1) 0%, rgba(157, 186, 228, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1797:8" style="z-index: 21; width: 312px; position: absolute; left: calc(50% - 156px - 0px); top: calc(50% - 70px - -9px); display: flex; flex-direction: column; padding: 8px 8px 8px 8px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1797:8;495:30" style="width: 296px; position: static; left: calc(50% - 148px - 0px); height: 124px; top: 8px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="45">I’m currently working on a city planning MMO </span><span key="61">in my spare time</span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="63">. </span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="80"> <a href="https://github.com/warronbebster/mayor_game">Here’s the github</a></span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="end"> if you’re curious.</span></div></div><div id="1797:12" style="transform: matrix(0.8067948222160339,-0.5908317565917969,0.5908317565917969,0.8067948222160339,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 27px - 125px); height: 54px; top: calc(50% - 27px - 125.65606689453125px); color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">🏙</span></div><div id="1797:16" style="transform: matrix(0.9114494323730469,0.4114121198654175,-0.4114121198654175,0.9114494323730469,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 27px - -129.21630859375px); height: 54px; top: calc(50% - 27px - 131px); color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">🛠</span></div><div id="1797:14" style="transform: matrix(0.9600539207458496,0.27981507778167725,-0.27981507778167725,0.9600539207458496,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 27px - 26.366455078125px); height: 54px; top: calc(50% - 27px - 116.03744506835938px); color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">💻</span></div><div id="1797:15" style="transform: matrix(0.9606214165687561,-0.27786049246788025,0.27786049246788025,0.9606214165687561,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 27px - -40.56097412109375px); height: 54px; top: calc(50% - 27px - 154.9955291748047px); color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">🕹</span></div></section>',]}, { name: "This Site", stories:['<section class="frame" style="overflow: hidden; background-color: rgba(229, 229, 229, 1); border: 1px solid rgba(167, 167, 167, 1);  width:100%; height:100%; display:block;" ><div id="759:0" style="width: 337px; position: absolute; left: calc(50% - 168.5px - 0.5px); height: 196px; top: calc(50% - 98px - 6px); background-image: url(./images/figma); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="754:5" style="z-index: 21; transform: matrix(1.0000001192092896,-1.3877787807814457e-17,1.3877787807814457e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 217.27194213867188px; position: absolute; left: calc(50% - 108.63597106933594px - 0.3640289306640625px); top: calc(50% - 22px - -92px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I754:5;495:30" style="width: 205.27194213867188px; position: static; left: calc(50% - 102.63597106933594px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="21"> <a href="https://bit.ly/2SqieMK">Here’s the Figma file</a></span><span key="end"> if you want a peek under the hood.</span></div></div><div id="761:56" style="z-index: 21; transform: matrix(1.0000001192092896,-2.7755578924351364e-17,2.7755578924351364e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 121.5px - 0.5px); height: 16px; bottom: 99.9681396484375px; opacity: 0.5; color: rgba(0, 0, 0, 1); font-size: 12px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="4">And </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="14"> <a href="https://github.com/warronbebster/bwebsite">the github</a></span><span key="end"> if you wanna go even deeper.</span></div><div id="754:8" style="width: 284px; position: absolute; left: calc(50% - 142px - 0px); top: 74px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I754:8;495:30" style="width: 272px; position: static; left: calc(50% - 136px - 0px); height: 69px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">This site is built from scratch and updates live from a Figma file, so I can update it whenever.</span></div></div><div id="761:76" style="transform: matrix(0.9293728470802307,-0.3691423535346985,0.3691423535346985,0.9293728470802307,0,0); transform-origin: 0% 0%; width: 50px; position: absolute; left: 37px; height: 50px; top: calc(50% - 25px - 101.54287719726562px); overflow: hidden; background-color: rgba(30, 30, 30, 1); border-radius: 8px 8px 8px 8px; "><div id="761:77" style="width: 22px; position: absolute; left: calc(50% - 11px - 0px); height: 34px; top: calc(50% - 17px - 0px); background-image: url(./images/figmaLogo); background-size: cover; "></div></div></section>',]}, { name: "Contact", stories:['<section class="frame" style="overflow: hidden; background-image: url(./images/!contact); background-size: cover;  width:100%; height:100%; display:block;" ><div id="583:1" style="z-index: 21; position: absolute; left: calc(50% - 75px - 0.5px); top: calc(50% - 17.5px - 4.5px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="583:2" style="position: static; left: calc(50% - 69px - 0px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="1">@</span><span key="end"><a href="https://twitter.com/WarronBebster">warronbebster</a></span></div></div><div id="583:3" style="z-index: 21; position: absolute; left: calc(50% - 89.5px - 0.5px); top: calc(50% - 17.5px - -54.935028076171875px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="581:33" style="width: 23px; position: static; left: 6px; height: 23px; top: 6px; flex: none; flex-grow: 0; margin-right: 6px; background-image: url(./images/ig); background-size: cover; "></div><div id="583:4" style="position: static; left: calc(50% - 69px - -14.5px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="1">@</span><span key="end"><a href="https://www.instagram.com/barronwebster/">barronwebster</a></span></div></div><div id="583:5" style="position: absolute; left: calc(50% - 115px - 0.5px); top: calc(50% - 17.5px - -113.93502807617188px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="583:6" style="position: static; left: calc(50% - 109px - 0px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="5">hello</span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="6">@</span><span key="end">barronwebster.com</span></div></div><div id="785:44" style="transform: matrix(0.9876883625984192,-0.15643446147441864,0.15643446147441864,0.9876883625984192,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 35.5px - 1.0786285400390625px); height: 31px; top: 156.1741485595703px; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">say hi!</span></div></section>',]},  ];

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
    const file = "src/components/Story.svelte";

    // (87:2) {:else}
    function create_else_block$1(ctx) {
    	let section;

    	const block = {
    		c: function create() {
    			section = element("section");
    			section.textContent = "loading…";
    			add_location(section, file, 87, 4, 1657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(87:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (85:2) {#if showStoryContent}
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(85:2) {#if showStoryContent}",
    		ctx
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
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", div_class_value = "story " + /*displayPosition*/ ctx[1] + " " + " svelte-tz1p0n");
    			add_location(div, file, 83, 0, 1554);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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

    			if (dirty & /*displayPosition*/ 2 && div_class_value !== (div_class_value = "story " + /*displayPosition*/ ctx[1] + " " + " svelte-tz1p0n")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { storyContent = "<section>loading…</section" } = $$props; //prop so that you can pass which project from App
    	let { current = false } = $$props;
    	let { nextCover = false } = $$props;
    	let { next = false } = $$props;
    	let { prev = false } = $$props;
    	let displayPosition = "none";
    	let showStoryContent = false;

    	beforeUpdate(() => {
    		if (next) {
    			$$invalidate(1, displayPosition = "plus1");
    			$$invalidate(2, showStoryContent = true);
    		} else if (current) {
    			$$invalidate(1, displayPosition = "currentStory");
    			$$invalidate(2, showStoryContent = true);
    		} else if (prev) {
    			$$invalidate(1, displayPosition = "minus1");
    			$$invalidate(2, showStoryContent = true);
    		} else {
    			$$invalidate(1, displayPosition = "none");
    		}

    		if (nextCover) {
    			$$invalidate(2, showStoryContent = true);
    			$$invalidate(1, displayPosition += " nextCover");
    		}
    	});

    	const writable_props = ["storyContent", "current", "nextCover", "next", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Story> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Story", $$slots, []);

    	$$self.$set = $$props => {
    		if ("storyContent" in $$props) $$invalidate(0, storyContent = $$props.storyContent);
    		if ("current" in $$props) $$invalidate(3, current = $$props.current);
    		if ("nextCover" in $$props) $$invalidate(4, nextCover = $$props.nextCover);
    		if ("next" in $$props) $$invalidate(5, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(6, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		storyContent,
    		current,
    		nextCover,
    		next,
    		prev,
    		displayPosition,
    		showStoryContent
    	});

    	$$self.$inject_state = $$props => {
    		if ("storyContent" in $$props) $$invalidate(0, storyContent = $$props.storyContent);
    		if ("current" in $$props) $$invalidate(3, current = $$props.current);
    		if ("nextCover" in $$props) $$invalidate(4, nextCover = $$props.nextCover);
    		if ("next" in $$props) $$invalidate(5, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(6, prev = $$props.prev);
    		if ("displayPosition" in $$props) $$invalidate(1, displayPosition = $$props.displayPosition);
    		if ("showStoryContent" in $$props) $$invalidate(2, showStoryContent = $$props.showStoryContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		storyContent,
    		displayPosition,
    		showStoryContent,
    		current,
    		nextCover,
    		next,
    		prev
    	];
    }

    class Story extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			storyContent: 0,
    			current: 3,
    			nextCover: 4,
    			next: 5,
    			prev: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Story",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get storyContent() {
    		throw new Error("<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set storyContent(value) {
    		throw new Error("<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nextCover() {
    		throw new Error("<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nextCover(value) {
    		throw new Error("<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		throw new Error("<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set next(value) {
    		throw new Error("<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<Story>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<Story>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.20.1 */
    const file$1 = "src/components/Nav.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (75:4) {#each projectArray as project, i}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*project*/ ctx[7].name + "";
    	let t0;
    	let t1;
    	let li_class_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*i*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(li, "class", li_class_value = " navItem " + (/*projectIndex*/ ctx[0] == /*i*/ ctx[9]
    			? "activeNavItem"
    			: "inactiveNavItem") + "\n        " + (/*navOpen*/ ctx[1]
    			? "visible"
    			: /*projectIndex*/ ctx[0] !== /*i*/ ctx[9]
    				? "hidden"
    				: "visible") + "\n        " + " svelte-iymz21");

    			add_location(li, file$1, 75, 6, 1532);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			if (remount) dispose();
    			dispose = listen_dev(li, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*projectIndex, navOpen*/ 3 && li_class_value !== (li_class_value = " navItem " + (/*projectIndex*/ ctx[0] == /*i*/ ctx[9]
    			? "activeNavItem"
    			: "inactiveNavItem") + "\n        " + (/*navOpen*/ ctx[1]
    			? "visible"
    			: /*projectIndex*/ ctx[0] !== /*i*/ ctx[9]
    				? "hidden"
    				: "visible") + "\n        " + " svelte-iymz21")) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(75:4) {#each projectArray as project, i}",
    		ctx
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
    			nav = element("nav");
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ol, "class", "svelte-iymz21");
    			add_location(ol, file$1, 72, 2, 1481);
    			attr_dev(nav, "class", nav_class_value = "" + (null_to_empty(/*navOpen*/ ctx[1] ? "open" : "closed") + " svelte-iymz21"));
    			add_location(nav, file$1, 60, 0, 1251);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ol);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(nav, "mouseover", /*mouseover_handler*/ ctx[5], false, false, false),
    				listen_dev(nav, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false)
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

    			if (dirty & /*navOpen*/ 2 && nav_class_value !== (nav_class_value = "" + (null_to_empty(/*navOpen*/ ctx[1] ? "open" : "closed") + " svelte-iymz21"))) {
    				attr_dev(nav, "class", nav_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { projectIndex = 0 } = $$props; //prop so that you can pass which project from App
    	let { navOpen = false } = $$props;
    	const dispatch = createEventDispatcher(); //way to dispatch events across components

    	function showNav(openOrNot) {
    		dispatch("message", { open: openOrNot });
    	}

    	const writable_props = ["projectIndex", "navOpen"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, []);

    	const click_handler = i => {
    		if (window.innerWidth < 640) {
    			if (navOpen) dispatch("project", i);
    			projectIndex == i ? showNav(!navOpen) : showNav(false);
    		} else {
    			dispatch("project", i);
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

    	$$self.$set = $$props => {
    		if ("projectIndex" in $$props) $$invalidate(0, projectIndex = $$props.projectIndex);
    		if ("navOpen" in $$props) $$invalidate(1, navOpen = $$props.navOpen);
    	};

    	$$self.$capture_state = () => ({
    		projectArray,
    		push,
    		projectIndex,
    		navOpen,
    		createEventDispatcher,
    		dispatch,
    		showNav
    	});

    	$$self.$inject_state = $$props => {
    		if ("projectIndex" in $$props) $$invalidate(0, projectIndex = $$props.projectIndex);
    		if ("navOpen" in $$props) $$invalidate(1, navOpen = $$props.navOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		projectIndex,
    		navOpen,
    		dispatch,
    		showNav,
    		click_handler,
    		mouseover_handler,
    		mouseleave_handler
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, not_equal, { projectIndex: 0, navOpen: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get projectIndex() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectIndex(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get navOpen() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navOpen(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Stories.svelte generated by Svelte v3.20.1 */

    const { window: window_1 } = globals;
    const file$2 = "src/components/Stories.svelte";

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

    // (436:8) {#if params.project == i}
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
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "indicators");
    			attr_dev(div, "class", "svelte-n01c88");
    			add_location(div, file$2, 437, 10, 11718);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(436:8) {#if params.project == i}",
    		ctx
    	});

    	return block;
    }

    // (448:14) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "nextIndicators svelte-n01c88");
    			add_location(div, file$2, 448, 16, 12113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(448:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (442:42) 
    function create_if_block_2(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			attr_dev(div0, "id", "loadingBar");
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*held*/ ctx[3] || /*navOpen*/ ctx[5] ? "paused" : "no") + " svelte-n01c88"));
    			add_location(div0, file$2, 443, 18, 11946);
    			attr_dev(div1, "id", "currentIndicator");
    			attr_dev(div1, "class", "svelte-n01c88");
    			add_location(div1, file$2, 442, 16, 11900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*held, navOpen*/ 40 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*held*/ ctx[3] || /*navOpen*/ ctx[5] ? "paused" : "no") + " svelte-n01c88"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(442:42) ",
    		ctx
    	});

    	return block;
    }

    // (440:14) {#if params.story > p}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-n01c88");
    			add_location(div, file$2, 440, 16, 11833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(440:14) {#if params.story > p}",
    		ctx
    	});

    	return block;
    }

    // (439:12) {#each stories as story, p}
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(439:12) {#each stories as story, p}",
    		ctx
    	});

    	return block;
    }

    // (455:8) {#each stories as story, j}
    function create_each_block_1(ctx) {
    	let current;

    	const story = new Story({
    			props: {
    				storyContent: /*story*/ ctx[34],
    				current: /*params*/ ctx[0].project == /*i*/ ctx[33] && /*params*/ ctx[0].story == /*j*/ ctx[36]
    				? true
    				: false,
    				next: /*next*/ ctx[6].project == /*i*/ ctx[33] && /*next*/ ctx[6].story == /*j*/ ctx[36]
    				? true
    				: false,
    				prev: /*prev*/ ctx[7].project == /*i*/ ctx[33] && /*prev*/ ctx[7].story == /*j*/ ctx[36]
    				? true
    				: false,
    				nextCover: /*i*/ ctx[33] == /*nextProject*/ ctx[8]
    				? /*j*/ ctx[36] == /*activeStories*/ ctx[1][/*nextProject*/ ctx[8]]
    					? true
    					: false
    				: /*i*/ ctx[33] == /*prevProject*/ ctx[9]
    					? /*j*/ ctx[36] == /*activeStories*/ ctx[1][/*prevProject*/ ctx[9]]
    						? true
    						: false
    					: false
    			},
    			$$inline: true
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

    			if (dirty[0] & /*params*/ 1) story_changes.current = /*params*/ ctx[0].project == /*i*/ ctx[33] && /*params*/ ctx[0].story == /*j*/ ctx[36]
    			? true
    			: false;

    			if (dirty[0] & /*next*/ 64) story_changes.next = /*next*/ ctx[6].project == /*i*/ ctx[33] && /*next*/ ctx[6].story == /*j*/ ctx[36]
    			? true
    			: false;

    			if (dirty[0] & /*prev*/ 128) story_changes.prev = /*prev*/ ctx[7].project == /*i*/ ctx[33] && /*prev*/ ctx[7].story == /*j*/ ctx[36]
    			? true
    			: false;

    			if (dirty[0] & /*nextProject, activeStories, prevProject*/ 770) story_changes.nextCover = /*i*/ ctx[33] == /*nextProject*/ ctx[8]
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(455:8) {#each stories as story, j}",
    		ctx
    	});

    	return block;
    }

    // (427:4) {#each projectArray as { name, stories }
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

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();

    			attr_dev(div, "class", div_class_value = "project " + (/*params*/ ctx[0].project == /*i*/ ctx[33]
    			? "currentProject "
    			: "") + (/*i*/ ctx[33] == /*nextProject*/ ctx[8]
    			? "nextProject "
    			: "") + (/*i*/ ctx[33] == /*prevProject*/ ctx[9]
    			? "prevProject "
    			: "") + " svelte-n01c88");

    			attr_dev(div, "style", div_style_value = "" + ((/*held*/ ctx[3] && (/*i*/ ctx[33] == /*params*/ ctx[0].project || /*i*/ ctx[33] == /*nextProject*/ ctx[8] || /*i*/ ctx[33] == /*prevProject*/ ctx[9])
    			? "transform: translateX(" + (/*i*/ ctx[33] == /*prevProject*/ ctx[9]
    				? -100
    				: /*i*/ ctx[33] == /*nextProject*/ ctx[8] ? 100 : 0) + "%) rotateY(" + (Math.min(Math.max(/*gesture_gap*/ ctx[2] / 4.2, -90), 90) + (/*i*/ ctx[33] == /*nextProject*/ ctx[8] ? 90 : 0) + (/*i*/ ctx[33] == /*prevProject*/ ctx[9] ? -90 : 0)) + "deg) ;"
    			: "") + "\n        " + (/*params*/ ctx[0].project == /*i*/ ctx[33]
    			? "transform-origin: center " + /*swipeDirection*/ ctx[4] + ";"
    			: "") + (/*nextProject*/ ctx[8] == /*i*/ ctx[33]
    			? "transform-origin: center left; "
    			: " ") + (/*prevProject*/ ctx[9] == /*i*/ ctx[33]
    			? "transform-origin: center right; "
    			: " ") + (!/*held*/ ctx[3]
    			? "transition: left .5s ease, transform .5s ease; "
    			: "transition: left 0s, transform 0s ")));

    			add_location(div, file$2, 429, 6, 10732);
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

    			if (!current || dirty[0] & /*params, nextProject, prevProject*/ 769 && div_class_value !== (div_class_value = "project " + (/*params*/ ctx[0].project == /*i*/ ctx[33]
    			? "currentProject "
    			: "") + (/*i*/ ctx[33] == /*nextProject*/ ctx[8]
    			? "nextProject "
    			: "") + (/*i*/ ctx[33] == /*prevProject*/ ctx[9]
    			? "prevProject "
    			: "") + " svelte-n01c88")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*held, params, nextProject, prevProject, gesture_gap, swipeDirection*/ 797 && div_style_value !== (div_style_value = "" + ((/*held*/ ctx[3] && (/*i*/ ctx[33] == /*params*/ ctx[0].project || /*i*/ ctx[33] == /*nextProject*/ ctx[8] || /*i*/ ctx[33] == /*prevProject*/ ctx[9])
    			? "transform: translateX(" + (/*i*/ ctx[33] == /*prevProject*/ ctx[9]
    				? -100
    				: /*i*/ ctx[33] == /*nextProject*/ ctx[8] ? 100 : 0) + "%) rotateY(" + (Math.min(Math.max(/*gesture_gap*/ ctx[2] / 4.2, -90), 90) + (/*i*/ ctx[33] == /*nextProject*/ ctx[8] ? 90 : 0) + (/*i*/ ctx[33] == /*prevProject*/ ctx[9] ? -90 : 0)) + "deg) ;"
    			: "") + "\n        " + (/*params*/ ctx[0].project == /*i*/ ctx[33]
    			? "transform-origin: center " + /*swipeDirection*/ ctx[4] + ";"
    			: "") + (/*nextProject*/ ctx[8] == /*i*/ ctx[33]
    			? "transform-origin: center left; "
    			: " ") + (/*prevProject*/ ctx[9] == /*i*/ ctx[33]
    			? "transform-origin: center right; "
    			: " ") + (!/*held*/ ctx[3]
    			? "transition: left .5s ease, transform .5s ease; "
    			: "transition: left 0s, transform 0s ")))) {
    				attr_dev(div, "style", div_style_value);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(427:4) {#each projectArray as { name, stories }",
    		ctx
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
    				navOpen: /*navOpen*/ ctx[5]
    			},
    			$$inline: true
    		});

    	nav.$on("message", /*showNav*/ ctx[10]);
    	nav.$on("project", /*handleNavProject*/ ctx[11]);
    	let each_value = projectArray;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t = space();
    			div = element("div");
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(main, "style", main_style_value = "transform: translateX(" + (/*held*/ ctx[3]
    			? Math.max(Math.min(/*gesture_gap*/ ctx[2] * 1.1, 460), -460)
    			: 0) + "px);\n    " + (/*held*/ ctx[3]
    			? "transition: transform 0s;"
    			: "transition: transform .5s ease;"));

    			attr_dev(main, "class", "svelte-n01c88");
    			add_location(main, file$2, 422, 2, 10463);
    			set_style(div, "overflow", "hidden");
    			set_style(div, "height", "100vh");
    			set_style(div, "width", "100vw");
    			set_style(div, "display", "flex");
    			set_style(div, "align-items", "center");
    			set_style(div, "justify-content", "center");
    			set_style(div, "perspective", "1080px");
    			set_style(div, "cursor", "ew-resize");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*held*/ ctx[3] ? "grabbing" : "no") + " svelte-n01c88"));
    			add_location(div, file$2, 398, 0, 9898);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    				listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[15], false, false, false),
    				listen_dev(div, "mousedown", /*mousedown_handler*/ ctx[24], false, false, false),
    				listen_dev(div, "mousemove", /*mousemove_handler*/ ctx[25], false, false, false),
    				listen_dev(div, "mouseup", /*mouseup_handler*/ ctx[26], false, false, false),
    				listen_dev(div, "touchstart", prevent_default(/*touchstart_handler*/ ctx[27]), false, true, false),
    				listen_dev(div, "touchmove", /*touchmove_handler*/ ctx[28], { passive: true }, false, false),
    				listen_dev(div, "touchend", prevent_default(/*touchend_handler*/ ctx[29]), false, true, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			const nav_changes = {};
    			if (dirty[0] & /*params*/ 1) nav_changes.projectIndex = parseInt(/*params*/ ctx[0].project);
    			if (dirty[0] & /*navOpen*/ 32) nav_changes.navOpen = /*navOpen*/ ctx[5];
    			nav.$set(nav_changes);

    			if (dirty[0] & /*params, nextProject, prevProject, held, gesture_gap, swipeDirection, next, prev, activeStories, navOpen*/ 1023) {
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

    			if (!current || dirty[0] & /*held, gesture_gap*/ 12 && main_style_value !== (main_style_value = "transform: translateX(" + (/*held*/ ctx[3]
    			? Math.max(Math.min(/*gesture_gap*/ ctx[2] * 1.1, 460), -460)
    			: 0) + "px);\n    " + (/*held*/ ctx[3]
    			? "transition: transform 0s;"
    			: "transition: transform .5s ease;"))) {
    				attr_dev(main, "style", main_style_value);
    			}

    			if (!current || dirty[0] & /*held*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(/*held*/ ctx[3] ? "grabbing" : "no") + " svelte-n01c88"))) {
    				attr_dev(div, "class", div_class_value);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const swipeSensitivity = 100;
    const storyTimerTime = 60000; //time limit for stories, ms

    function Timer(callback, delay) {
    	var timerId, start, delayStore = delay, remaining = delay;

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
    	let gesture_start, gesture_active, gesture_gap = 0;
    	let held = false;
    	let swipeDirection = "right";
    	let gestureTimedOut = true; //whether a gesture has timed out
    	let gestureTimer; //timer object to time that
    	let storyTimer; //timer object to time stories
    	let navOpen = false;

    	const showNav = function (event) {
    		$$invalidate(5, navOpen = event.detail.open);
    		storyTimer.pause();
    	};

    	function handleNavProject(event) {
    		pushHandler(event.detail, 0);
    		storyTimer.resume();
    	}

    	function pushHandler(project, story) {
    		//s omething in this router
    		// console.log("pushHandler :" + project + ", " + story);
    		push(`/${project.toString()}/${story.toString()}`); //push to router

    		if (storyTimer) storyTimer.reset();
    	}

    	function handleProjects(direction) {
    		if (direction == "next") {
    			pushHandler(next.project, next.story);
    		} else if (direction == "prev") {
    			pushHandler(prev.project, prev.story);
    		} else if (direction == "nextProject") {
    			pushHandler(nextProject, activeStories[nextProject]);
    		} else if (direction == "prevProject") {
    			pushHandler(prevProject, activeStories[prevProject]);
    		}
    	}

    	function gestureDown(e) {
    		//when a gesture starts
    		if (navOpen) {
    			$$invalidate(5, navOpen = false); //close nav
    			storyTimer.resume(); //pause story timer
    		} else {
    			storyTimer.pause(); //pause story timer

    			// navOpen = false; //close nav
    			$$invalidate(3, held = true); //start holding gesture

    			gestureTimedOut = false; //reset gestureTimedOut, hasn't timed out yet

    			e.type == "touchstart"
    			? gesture_start = Math.round(e.changedTouches[0].pageX)
    			: gesture_start = e.pageX; //where the event starts

    			gesture_active = gesture_start;

    			gestureTimer = setTimeout(
    				() => {
    					gestureTimedOut = true; //start gesture timer
    				},
    				300
    			);
    		}
    	}

    	function gestureMove(e) {
    		//when ya movin
    		e.type == "touchmove"
    		? gesture_active = Math.round(e.changedTouches[0].pageX)
    		: gesture_active = e.pageX;

    		$$invalidate(2, gesture_gap = gesture_active - gesture_start); //set the gap between start and where you've dragged

    		gesture_gap > 0
    		? $$invalidate(4, swipeDirection = "left")
    		: $$invalidate(4, swipeDirection = "right");
    	}

    	function gestureUp(e) {
    		storyTimer.resume();

    		if (!gestureTimedOut) {
    			//if the gesture hasn't timed out
    			if (gesture_active > gesture_start + swipeSensitivity) {
    				handleProjects("prevProject");
    			} else if (gesture_active < gesture_start - swipeSensitivity) {
    				handleProjects("nextProject");
    			} else {
    				//JUST GO NEXT OR PREV
    				if (Math.abs(gesture_gap) < 10) {
    					gesture_active > window.innerWidth / 2
    					? handleProjects("next")
    					: handleProjects("prev");
    				}
    			}
    		} else {
    			//if the gesture has timed out
    			if (gesture_active > gesture_start + 200) {
    				handleProjects("prevProject");
    			} else if (gesture_active < gesture_start - 200) {
    				handleProjects("nextProject");
    			}
    		} //reset stuff

    		// if (storyTimer) storyTimer.reset();
    		if (gestureTimer) clearTimeout(gestureTimer);

    		$$invalidate(3, held = false); //end holding gesture
    		gesture_start = 0;
    		gesture_active = 0;
    		$$invalidate(2, gesture_gap = 0);
    	}

    	function handleKeydown(e) {
    		if (e.keyCode == 39 || e.keyCode == 32 || e.keyCode == 68) {
    			handleProjects("next");
    		} else if (e.keyCode == 37 || e.keyCode == 8 || e.keyCode == 65) {
    			handleProjects("prev");
    		}
    	}

    	onMount(() => {
    		//when first mounts; basically on page load
    		storyTimer = new Timer(() => {
    				handleProjects("next");
    			},
    		storyTimerTime);

    		function callback(e) {
    			var e = window.e || e;
    			if (e.target.tagName !== "A") return;

    			// Do something
    			window.location.href = e.srcElement.href; //go to link
    		}

    		if (document.addEventListener) document.addEventListener("touchend", callback, false); else document.attachEvent("onclick", callback);
    	});

    	onDestroy(() => {
    		storyTimer.clear();
    		storyTimer = null;
    	});

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stories> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stories", $$slots, []);

    	const mousedown_handler = e => {
    		gestureDown(e);
    	};

    	const mousemove_handler = e => {
    		if (held) gestureMove(e);
    	};

    	const mouseup_handler = e => {
    		if (held) gestureUp();
    	};

    	const touchstart_handler = e => {
    		gestureDown(e);
    	};

    	const touchmove_handler = e => {
    		if (held) gestureMove(e);
    	};

    	const touchend_handler = e => {
    		if (held) gestureUp();
    	};

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
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
    		prevProject
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeStories" in $$props) $$invalidate(1, activeStories = $$props.activeStories);
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("bufferProject" in $$props) $$invalidate(16, bufferProject = $$props.bufferProject);
    		if ("gesture_start" in $$props) gesture_start = $$props.gesture_start;
    		if ("gesture_active" in $$props) gesture_active = $$props.gesture_active;
    		if ("gesture_gap" in $$props) $$invalidate(2, gesture_gap = $$props.gesture_gap);
    		if ("held" in $$props) $$invalidate(3, held = $$props.held);
    		if ("swipeDirection" in $$props) $$invalidate(4, swipeDirection = $$props.swipeDirection);
    		if ("gestureTimedOut" in $$props) gestureTimedOut = $$props.gestureTimedOut;
    		if ("gestureTimer" in $$props) gestureTimer = $$props.gestureTimer;
    		if ("storyTimer" in $$props) storyTimer = $$props.storyTimer;
    		if ("navOpen" in $$props) $$invalidate(5, navOpen = $$props.navOpen);
    		if ("next" in $$props) $$invalidate(6, next = $$props.next);
    		if ("prev" in $$props) $$invalidate(7, prev = $$props.prev);
    		if ("nextProject" in $$props) $$invalidate(8, nextProject = $$props.nextProject);
    		if ("prevProject" in $$props) $$invalidate(9, prevProject = $$props.prevProject);
    	};

    	let next;
    	let prev;
    	let nextProject;
    	let prevProject;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*params*/ 1) {
    			// when params change, update activeStories
    			// these $ variables recompute when stuff changes
    			 $$invalidate(1, activeStories[parseInt(params.project)] = parseInt(params.story), activeStories);
    		}

    		if ($$self.$$.dirty[0] & /*params*/ 1) {
    			 $$invalidate(6, next = getNext(params));
    		}

    		if ($$self.$$.dirty[0] & /*params*/ 1) {
    			 $$invalidate(7, prev = getPrev(params));
    		}

    		if ($$self.$$.dirty[0] & /*params*/ 1) {
    			 $$invalidate(8, nextProject = parseInt(params.project) < projectArray.length - 1
    			? parseInt(params.project) + 1
    			: 0);
    		}

    		if ($$self.$$.dirty[0] & /*params*/ 1) {
    			 $$invalidate(9, prevProject = parseInt(params.project) > 0
    			? parseInt(params.project) - 1
    			: projectArray.length - 1);
    		}

    		if ($$self.$$.dirty[0] & /*params, bufferProject*/ 65537) {
    			//if the project has changed since router push went through
    			 if (parseInt(params.project) != bufferProject) {
    				if (parseInt(params.project) == 0) {
    					bufferProject == projectArray.length - 1
    					? $$invalidate(4, swipeDirection = "left")
    					: $$invalidate(4, swipeDirection = "right");
    				} else if (parseInt(params.project) == projectArray.length - 1) {
    					bufferProject == 0
    					? $$invalidate(4, swipeDirection = "right")
    					: $$invalidate(4, swipeDirection = "left");
    				} else {
    					parseInt(params.project) > bufferProject
    					? $$invalidate(4, swipeDirection = "left")
    					: $$invalidate(4, swipeDirection = "right");
    				}

    				$$invalidate(16, bufferProject = parseInt(params.project));
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
    		touchend_handler
    	];
    }

    class Stories extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, not_equal, { params: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stories",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get params() {
    		throw new Error("<Stories>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Stories>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
    	router.$on("routeLoaded", routeLoaded);

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function routeLoaded(event) {
    	// console.log("routeLoaded");
    	let loadedRoute = event.detail.location.split("/"); //route

    	loadedRoute.shift(); //delete first item

    	if (loadedRoute[0]) {
    		//if there's even a value there
    		if (Number.isInteger(parseInt(loadedRoute[0]))) {
    			//if it's a number
    			if (//if first number is out of range
    			parseInt(loadedRoute[0]) >= projectArray.length || parseInt(loadedRoute[0]) < 0) {
    				replace("/");
    			} else {
    				//if the first number is in range
    				if (loadedRoute.length == 2) {
    					//if there's a second value
    					if (Number.isInteger(parseInt(loadedRoute[1]))) {
    						//& it's a number
    						if (parseInt(loadedRoute[1]) >= projectArray[parseInt(loadedRoute[0])].stories.length) {
    							// if it's higher than the amount of stories in that project
    							replace("/" + loadedRoute[0] + "/0");
    						}
    					} else {
    						//if second value is not a number
    						replace("/" + loadedRoute[0] + "/0");
    					}
    				} else if (loadedRoute.length = 1) {
    					//if there's only the first number
    					replace("/" + loadedRoute[0] + "/0");
    				}
    			}
    		} else {
    			//if first value is not even a number
    			replace("/"); //BAIL
    		}
    	} else {
    		replace("/0/0");
    	}
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Router,
    		projectArray,
    		replace,
    		routes,
    		routeLoaded
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
=======
var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function i(t){t.forEach(e)}function o(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(t,e){return t!=t?e==e:t!==e}function s(e,...n){if(null==e)return t;const i=e.subscribe(...n);return i.unsubscribe?()=>i.unsubscribe():i}function l(t){return null==t?"":t}function p(t,e){t.appendChild(e)}function x(t,e,n){t.insertBefore(e,n||null)}function d(t){t.parentNode.removeChild(t)}function f(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function c(t){return document.createElement(t)}function g(t){return document.createTextNode(t)}function h(){return g(" ")}function u(){return g("")}function m(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function b(t){return function(e){return e.preventDefault(),t.call(this,e)}}function y(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function v(t,e,n,i){t.style.setProperty(e,n,i?"important":"")}class w{constructor(t,e=null){this.e=c("div"),this.a=e,this.u(t)}m(t,e=null){for(let n=0;n<this.n.length;n+=1)x(t,this.n[n],e);this.t=t}u(t){this.e.innerHTML=t,this.n=Array.from(this.e.childNodes)}p(t){this.d(),this.u(t),this.m(this.t,this.a)}d(){this.n.forEach(d)}}let k;function I(t){k=t}function M(){if(!k)throw new Error("Function called outside component initialization");return k}function S(){const t=M();return(e,n)=>{const i=t.$$.callbacks[e];if(i){const o=function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(e,n);i.slice().forEach(e=>{e.call(t,o)})}}}function P(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach(t=>t(e))}const B=[],j=[],z=[],$=[],_=Promise.resolve();let E=!1;function C(){E||(E=!0,_.then(D))}function A(){return C(),_}function T(t){z.push(t)}let N=!1;const O=new Set;function D(){if(!N){N=!0;do{for(let t=0;t<B.length;t+=1){const e=B[t];I(e),L(e.$$)}for(B.length=0;j.length;)j.pop()();for(let t=0;t<z.length;t+=1){const e=z[t];O.has(e)||(O.add(e),e())}z.length=0}while(B.length);for(;$.length;)$.pop()();E=!1,N=!1,O.clear()}}function L(t){if(null!==t.fragment){t.update(),i(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(T)}}const W=new Set;let q;function G(){q={r:0,c:[],p:q}}function H(){q.r||i(q.c),q=q.p}function X(t,e){t&&t.i&&(W.delete(t),t.i(e))}function F(t,e,n,i){if(t&&t.o){if(W.has(t))return;W.add(t),q.c.push(()=>{W.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}}const R="undefined"!=typeof window?window:global;function Y(t){t&&t.c()}function U(t,n,r){const{fragment:a,on_mount:s,on_destroy:l,after_update:p}=t.$$;a&&a.m(n,r),T(()=>{const n=s.map(e).filter(o);l?l.push(...n):i(n),t.$$.on_mount=[]}),p.forEach(T)}function V(t,e){const n=t.$$;null!==n.fragment&&(i(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function K(e,o,r,a,s,l,p=[-1]){const x=k;I(e);const f=o.props||{},c=e.$$={fragment:null,ctx:null,props:l,update:t,not_equal:s,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(x?x.$$.context:[]),callbacks:n(),dirty:p};let g=!1;if(c.ctx=r?r(e,f,(t,n,...i)=>{const o=i.length?i[0]:n;return c.ctx&&s(c.ctx[t],c.ctx[t]=o)&&(c.bound[t]&&c.bound[t](o),g&&function(t,e){-1===t.$$.dirty[0]&&(B.push(t),C(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}(e,t)),n}):[],c.update(),g=!0,i(c.before_update),c.fragment=!!a&&a(c.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);c.fragment&&c.fragment.l(t),t.forEach(d)}else c.fragment&&c.fragment.c();o.intro&&X(e.$$.fragment),U(e,o.target,o.anchor),D()}I(x)}class J{$destroy(){V(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}const Q=[];function Z(t,e){return{subscribe:tt(t,e).subscribe}}function tt(e,n=t){let i;const o=[];function a(t){if(r(e,t)&&(e=t,i)){const t=!Q.length;for(let t=0;t<o.length;t+=1){const n=o[t];n[1](),Q.push(n,e)}if(t){for(let t=0;t<Q.length;t+=2)Q[t][0](Q[t+1]);Q.length=0}}}return{set:a,update:function(t){a(t(e))},subscribe:function(r,s=t){const l=[r,s];return o.push(l),1===o.length&&(i=n(a)||t),r(e),()=>{const t=o.indexOf(l);-1!==t&&o.splice(t,1),0===o.length&&(i(),i=null)}}}}function et(e,n,r){const a=!Array.isArray(e),l=a?[e]:e,p=n.length<2;return Z(r,e=>{let r=!1;const x=[];let d=0,f=t;const c=()=>{if(d)return;f();const i=n(a?x[0]:x,e);p?e(i):f=o(i)?i:t},g=l.map((t,e)=>s(t,t=>{x[e]=t,d&=~(1<<e),r&&c()},()=>{d|=1<<e}));return r=!0,c(),function(){i(g),f()}})}function nt(t){let e,n;var i=t[0];if(i){var o=new i({});o.$on("routeEvent",t[10])}return{c(){o&&Y(o.$$.fragment),e=u()},m(t,i){o&&U(o,t,i),x(t,e,i),n=!0},p(t,n){if(i!==(i=t[0])){if(o){G();const t=o;F(t.$$.fragment,1,0,()=>{V(t,1)}),H()}i?((o=new i({})).$on("routeEvent",t[10]),Y(o.$$.fragment),X(o.$$.fragment,1),U(o,e.parentNode,e)):o=null}},i(t){n||(o&&X(o.$$.fragment,t),n=!0)},o(t){o&&F(o.$$.fragment,t),n=!1},d(t){t&&d(e),o&&V(o,t)}}}function it(t){let e,n;var i=t[0];function o(t){return{props:{params:t[1]}}}if(i){var r=new i(o(t));r.$on("routeEvent",t[9])}return{c(){r&&Y(r.$$.fragment),e=u()},m(t,i){r&&U(r,t,i),x(t,e,i),n=!0},p(t,n){const a={};if(2&n&&(a.params=t[1]),i!==(i=t[0])){if(r){G();const t=r;F(t.$$.fragment,1,0,()=>{V(t,1)}),H()}i?((r=new i(o(t))).$on("routeEvent",t[9]),Y(r.$$.fragment),X(r.$$.fragment,1),U(r,e.parentNode,e)):r=null}else i&&r.$set(a)},i(t){n||(r&&X(r.$$.fragment,t),n=!0)},o(t){r&&F(r.$$.fragment,t),n=!1},d(t){t&&d(e),r&&V(r,t)}}}function ot(t){let e,n,i,o;const r=[it,nt],a=[];function s(t,e){return t[1]?0:1}return e=s(t),n=a[e]=r[e](t),{c(){n.c(),i=u()},m(t,n){a[e].m(t,n),x(t,i,n),o=!0},p(t,[o]){let l=e;e=s(t),e===l?a[e].p(t,o):(G(),F(a[l],1,1,()=>{a[l]=null}),H(),n=a[e],n||(n=a[e]=r[e](t),n.c()),X(n,1),n.m(i.parentNode,i))},i(t){o||(X(n),o=!0)},o(t){F(n),o=!1},d(t){a[e].d(t),t&&d(i)}}}function rt(){const t=window.location.href.indexOf("#/");let e=t>-1?window.location.href.substr(t+1):"/";const n=e.indexOf("?");let i="";return n>-1&&(i=e.substr(n+1),e=e.substr(0,n)),{location:e,querystring:i}}const at=Z(null,(function(t){t(rt());const e=()=>{t(rt())};return window.addEventListener("hashchange",e,!1),function(){window.removeEventListener("hashchange",e,!1)}}));et(at,t=>t.location),et(at,t=>t.querystring);function st(t){if(!t||t.length<1||"/"!=t.charAt(0)&&0!==t.indexOf("#/"))throw Error("Invalid parameter location");return A().then(()=>{const e=("#"==t.charAt(0)?"":"#")+t;try{window.history.replaceState(void 0,void 0,e)}catch(t){console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.")}window.dispatchEvent(new Event("hashchange"))})}function lt(e,n,i){let o,r=t;!function(t,e,n){t.$$.on_destroy.push(s(e,n))}(e,at,t=>i(4,o=t)),e.$$.on_destroy.push(()=>r());let{routes:a={}}=n,{prefix:l=""}=n;class p{constructor(t,e){if(!e||"function"!=typeof e&&("object"!=typeof e||!0!==e._sveltesparouter))throw Error("Invalid component object");if(!t||"string"==typeof t&&(t.length<1||"/"!=t.charAt(0)&&"*"!=t.charAt(0))||"object"==typeof t&&!(t instanceof RegExp))throw Error('Invalid value for "path" argument');const{pattern:n,keys:i}=function(t,e){if(t instanceof RegExp)return{keys:!1,pattern:t};var n,i,o,r,a=[],s="",l=t.split("/");for(l[0]||l.shift();o=l.shift();)"*"===(n=o[0])?(a.push("wild"),s+="/(.*)"):":"===n?(i=o.indexOf("?",1),r=o.indexOf(".",1),a.push(o.substring(1,~i?i:~r?r:o.length)),s+=~i&&!~r?"(?:/([^/]+?))?":"/([^/]+?)",~r&&(s+=(~i?"?":"")+"\\"+o.substring(r))):s+="/"+o;return{keys:a,pattern:new RegExp("^"+s+(e?"(?=$|/)":"/?$"),"i")}}(t);this.path=t,"object"==typeof e&&!0===e._sveltesparouter?(this.component=e.route,this.conditions=e.conditions||[],this.userData=e.userData):(this.component=e,this.conditions=[],this.userData=void 0),this._pattern=n,this._keys=i}match(t){l&&t.startsWith(l)&&(t=t.substr(l.length)||"/");const e=this._pattern.exec(t);if(null===e)return null;if(!1===this._keys)return e;const n={};let i=0;for(;i<this._keys.length;)n[this._keys[i]]=e[++i]||null;return n}checkConditions(t){for(let e=0;e<this.conditions.length;e++)if(!this.conditions[e](t))return!1;return!0}}const x=[];a instanceof Map?a.forEach((t,e)=>{x.push(new p(e,t))}):Object.keys(a).forEach(t=>{x.push(new p(t,a[t]))});let d=null,f=null;const c=S(),g=(t,e)=>{A().then(()=>{c(t,e)})};return e.$set=t=>{"routes"in t&&i(2,a=t.routes),"prefix"in t&&i(3,l=t.prefix)},e.$$.update=()=>{if(17&e.$$.dirty){i(0,d=null);let t=0;for(;!d&&t<x.length;){const e=x[t].match(o.location);if(e){const n={component:x[t].component,name:x[t].component.name,location:o.location,querystring:o.querystring,userData:x[t].userData};if(!x[t].checkConditions(n)){g("conditionsFailed",n);break}i(0,d=x[t].component),e&&"object"==typeof e&&Object.keys(e).length?i(1,f=e):i(1,f=null),g("routeLoaded",n)}t++}}},[d,f,a,l,o,p,x,c,g,function(t){P(e,t)},function(t){P(e,t)}]}class pt extends J{constructor(t){super(),K(this,t,lt,ot,r,{routes:2,prefix:3})}}const xt=[{name:"Hello",stories:['<section class="frame" style="overflow: hidden; background-image: url(./images/!intro); background-size: cover;  width:100%; height:100%; display:block;" ><div id="495:31" style="transform: matrix(0.9836799502372742,-0.17992709577083588,0.17992709577083588,0.9836799502372742,0,0); transform-origin: 0% 0%; position: absolute; left: 40.658447265625px; bottom: 117.63330078125px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="495:32" style="position: static; left: calc(50% - 92px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">You can also use arrow keys.</span></div></div><div id="578:25" style="transform: matrix(0.973799467086792,0.2274085283279419,-0.2274085283279419,0.973799467086792,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 133.6175994873047px - -57.62358093261719px); top: calc(50% - 22px - -33px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I578:25;495:30" style="width: 255.23519897460938px; position: static; left: calc(50% - 127.61759948730469px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">It works like instagram stories. Tap left or right, and swipe to skip chapters.</span></div></div><div id="579:44" style="transform: matrix(0.9876883625984192,-0.15643446147441864,0.15643446147441864,0.9876883625984192,0,0); transform-origin: 0% 0%; width: 348.8829345703125px; position: absolute; left: calc(50% - 174.44146728515625px - 6.55853271484375px); top: 106.57731628417969px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I579:44;495:30" style="width: 336.8829345703125px; position: static; left: calc(50% - 168.44146728515625px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Hi, I’m Barron. Welcome to my website :)</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(246, 207, 178, 1) 100%);  width:100%; height:100%; display:block;" ><div id="544:1" style="transform: matrix(0.9964331984519958,-0.08438510447740555,0.08438510447740555,0.9964331984519958,0,0); transform-origin: 0% 0%; width: 327.478515625px; position: absolute; left: calc(50% - 163.7392578125px - 19.575170516967773px); height: 271.1796875px; top: 270.49700927734375px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; overflow: hidden; "><div id="294:0" style="width: 327.478515625px; position: static; right: 0px; height: 247.1796875px; top: 0px; flex: none; align-self: stretch; flex-grow: 1; margin-bottom: 6px; background-image: url(./images/no_spaces); background-size: cover; box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "></div><div id="544:0" style="position: static; right: 177.478515625px; height: 18px; top: 253.1796875px; flex: none; flex-grow: 0; opacity: 0.699999988079071; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">FIG 1. me and software</span></div></div><div id="543:55" style="transform: matrix(0.9909805655479431,0.13400520384311676,-0.13400520384311676,0.9909805655479431,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 168px - -1.6786079406738281px); top: 70px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="593:0" style="position: static; right: 0px; top: calc(50% - 22px - 36.5px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 11px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I593:0;578:15" style="position: static; left: calc(50% - 162px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">I mostly design software.</span></div></div><div id="601:0" style="width: 218.92893981933594px; position: static; left: calc(50% - 109.46446990966797px - 58.535543286126085px); top: calc(50% - 31px - -27.50000762939453px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I601:0;495:30" style="width: 206.92893981933594px; position: static; left: calc(50% - 103.46446990966797px - 0px); height: 54px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Primarily zero-to-one launches for new services, focusing on emerging technology.</span></div></div></div><div id="1208:43" style="transform: matrix(0.9909805655479431,0.13400520384311676,-0.13400520384311676,0.9909805655479431,0,0); transform-origin: 0% 0%; width: 193.85501098632812px; position: absolute; right: 23.248764038085938px; bottom: 139px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:43;495:30" style="width: 181.85501098632812px; position: static; left: calc(50% - 90.92750549316406px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Sometimes I even write the software. Like this website!</span></div></div></section>','<section class="frame" style="overflow: hidden; background-image: url(./images/!city); background-size: cover;  width:100%; height:100%; display:block;" ><div id="1208:19" style="z-index: 21; transform: matrix(0.9937077760696411,-0.11200381815433502,0.11200381815433502,0.9937077760696411,0,0); transform-origin: 0% 0%; position: absolute; left: 24.10540771484375px; bottom: 135.29022216796875px; display: flex; flex-direction: row; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-end; "><div id="1208:20" style="position: static; left: 0px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:20;578:15" style="position: static; left: calc(50% - 16.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://risd.gd">RISD</a></span></div></div><div id="1208:21" style="position: static; left: 53px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:21;578:15" style="position: static; left: calc(50% - 36px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://upperquad.com/">Upperquad</a></span></div></div><div id="1208:22" style="position: static; left: 145px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 8px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:22;578:15" style="position: static; left: calc(50% - 35.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://metahaven.net/">Metahaven</a></span></div></div><div id="1208:23" style="position: static; left: 236px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:23;578:15" style="position: static; left: calc(50% - 41.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://maps.google.com/">Google Maps</a></span></div></div></div><div id="1208:27" style="transform: matrix(0.9911307096481323,-0.13289108872413635,0.13289108872413635,0.9911307096481323,0,0); transform-origin: 0% 0%; width: 286.0762023925781px; position: absolute; left: calc(50% - 143.03810119628906px - 35.96189880371094px); top: 92.81344604492188px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:27;495:30" style="width: 274.0762023925781px; position: static; left: calc(50% - 137.03810119628906px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I currently work @ google’s creative lab.</span></div></div><div id="1208:28" style="transform: matrix(0.9937077760696411,-0.11200381815433502,0.11200381815433502,0.9937077760696411,0,0); transform-origin: 0% 0%; position: absolute; left: 19.06524658203125px; bottom: 175.007080078125px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1208:28;578:15" style="position: static; left: calc(50% - 114.5px - 0px); height: 23px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">Before that, I spent time at:</span></div></div><div id="1865:72" style="transform: matrix(0.9849564433097839,0.17280274629592896,-0.17280274629592896,0.9849564433097839,0,0); transform-origin: 0% 0%; position: absolute; right: 20.64306640625px; top: 183px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1865:72;578:15" style="position: static; left: calc(50% - 124px - 0px); height: 23px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">this is the view from the office</span></div></div></section>','<section class="frame" style="overflow: hidden; background-image: url(./images/!talk); background-size: cover; border-radius: 2px 2px 2px 2px;  width:100%; height:100%; display:block;" ><div id="761:54" style="z-index: 21; transform: matrix(0.9921972155570984,-0.12467850744724274,0.12467850744724274,0.9921972155570984,0,0); transform-origin: 0% 0%; position: absolute; left: 13.8582763671875px; bottom: 116.57989501953125px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="555:35" style="position: static; left: 0px; bottom: 32px; display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I555:35;578:15" style="position: static; left: calc(50% - 175px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">and teach software/design.</span></div></div><div id="555:40" style="position: static; left: 0px; bottom: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I555:40;578:15" style="position: static; left: calc(50% - 75.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.notion.so/Design-in-the-Real-World-ac2a96893f034b85b1045025054009ce">Interaction design, SVA</a></span></div></div></div><div id="761:49" style="z-index: 21; transform: matrix(0.982860267162323,-0.18435218930244446,0.18435218930244446,0.982860267162323,0,0); transform-origin: 0% 0%; position: absolute; left: 17.87548828125px; top: 79.26504516601562px; display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="761:52" style="position: static; left: 0px; top: 0px; display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:52;578:15" style="position: static; left: calc(50% - 150px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">I also occasionally talk,</span></div></div><div id="1208:40" style="position: static; left: 0px; top: 50px; display: flex; flex-direction: row; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; flex: none; flex-grow: 0; "><div id="761:41" style="transform: matrix(1.0000001192092896,5.725459217842399e-9,-5.725459217842399e-9,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 0.00005506980960490182px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:41;578:15" style="position: static; left: calc(50% - 43px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.itsnicethat.com/articles/wix-playground-presents-data-narrative-design-round-up-digital-event-040320">It’s Nice That</a></span></div></div><div id="761:43" style="transform: matrix(1.0000001192092896,5.725459217842399e-9,-5.725459217842399e-9,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 104.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:43;578:15" style="position: static; left: calc(50% - 18px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://design.google/library/span2019/">SPAN</a></span></div></div><div id="761:44" style="position: static; left: 158.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-right: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:44;578:15" style="position: static; left: calc(50% - 15.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://thefwa.com/interviews/barron-webster">FWA</a></span></div></div><div id="761:42" style="position: static; left: 207.00001525878906px; top: 0px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:42;578:15" style="position: static; left: calc(50% - 13px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://web.mit.edu/">MIT</a></span></div></div></div></div><div id="761:38" style="z-index: 21; transform: matrix(0.9788978695869446,0.20434996485710144,-0.20434996485710144,0.9788978695869446,0,0); transform-origin: 0% 0%; position: absolute; right: 6.3427734375px; top: calc(50% - 70px - 20.264984130859375px); display: flex; flex-direction: column; padding: undefinedpx undefinedpx undefinedpx undefinedpx; justify-content: flex-start; align-items: flex-start; "><div id="761:39" style="position: static; right: 14px; top: calc(50% - 22px - 48px); display: flex; flex-direction: row; padding: 4px 8px 4px 8px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:39;578:15" style="position: static; left: calc(50% - 37px - 0px); height: 36px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 28px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">write,</span></div></div><div id="761:33" style="position: static; right: 0px; top: calc(50% - 13px - 7px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:33;578:15" style="position: static; left: calc(50% - 46px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://design.google/library/designing-and-learning-teachable-machine/">Google Design</a></span></div></div><div id="761:34" style="transform: matrix(1.0000001192092896,-5.551115123125783e-17,5.551115123125783e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; position: static; left: 0px; top: 82px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; margin-bottom: 6px; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:34;578:15" style="position: static; left: calc(50% - 43px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://www.itsnicethat.com/news/pay-interns-why-it-matters-barron-webster-opinion-180918">It’s Nice That</a></span></div></div><div id="761:32" style="position: static; right: 40px; top: calc(50% - 13px - -57px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; flex: none; flex-grow: 0; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I761:32;578:15" style="position: static; left: calc(50% - 26px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://medium.com/@warronbebster/the-future-of-augmented-reality-will-be-boring-fc95be238ef4">Medium</a></span></div></div></div></section>']},{name:"Work",stories:['<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1796:57" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 337.9999694824219px; position: absolute; left: calc(50% - 168.99998474121094px - 0.0000152587890625px); top: 43px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1796:57;495:30" style="width: 325.9999694824219px; position: static; left: calc(50% - 162.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; color: rgba(0, 0, 0, 1); " key="47">for the past year i’ve been leading design for </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; color: rgba(0, 0, 0, 1); " key="57"> <a href="https://restor.eco/">Restor.eco</a></span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; color: rgba(0, 0, 0, 1); " key="end">:</span></div></div><div id="1820:0" style="transform: matrix(0.9902680516242981,0.13917310535907745,-0.13917310535907745,0.9902680516242981,0,0); transform-origin: 0% 0%; width: 436.388427734375px; position: absolute; left: calc(50% - 218.1942138671875px - -21.531173706054688px); height: 266.3000183105469px; top: calc(50% - 133.15000915527344px - 28.849990844726562px); background-image: url(./images/Site); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1797:2" style="transform: matrix(0.9902680516242981,0.13917310535907745,-0.13917310535907745,0.9902680516242981,0,0); transform-origin: 0% 0%; width: 436.388427734375px; position: absolute; left: calc(50% - 218.1942138671875px - -21.53116798400879px); height: 266.3000183105469px; top: calc(50% - 133.15000915527344px - 28.849990844726562px); opacity: 0.5; background-image: url(./images/Site); background-size: cover; border-radius: 4px 4px 4px 4px; "></div><div id="1797:4" style="transform: matrix(0.9902680516242981,0.13917310535907745,-0.13917310535907745,0.9902680516242981,0,0); transform-origin: 0% 0%; width: 282.9093322753906px; position: absolute; right: 2.0665435791015625px; height: 791.1173706054688px; top: 57px; background-image: url(./images/insight_crop); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 8px 8px 8px 8px; "></div><div id="1797:5" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 229.99996948242188px; position: absolute; left: 12px; top: 43px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1797:5;495:30" style="width: 217.99996948242188px; position: static; left: calc(50% - 108.99998474121094px - 0px); height: 69px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">It’s an open data platform tailored for the global restoration movement. </span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1197:3" style="transform: matrix(0.9942448139190674,0.10713174939155579,-0.10713174939155579,0.9942448139190674,0,0); transform-origin: 0% 0%; width: 351.2443542480469px; position: absolute; left: calc(50% - 175.62217712402344px - -5.6975555419921875px); height: 196.723876953125px; top: calc(50% - 98.3619384765625px - -129.3619384765625px); background-image: url(./images/TM_screenshot_2); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="1197:14" style="transform: matrix(0.9942525029182434,0.1070602536201477,-0.1070602536201477,0.9942525029182434,0,0); transform-origin: 0% 0%; width: 413.2357482910156px; position: absolute; left: calc(50% - 206.6178741455078px - -12.703231811523438px); height: 185.33255004882812px; top: calc(50% - 92.66627502441406px - 166.64756774902344px); background-image: url(./images/what); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="1197:4" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 255.99996948242188px; position: absolute; left: calc(50% - 127.99998474121094px - 0.0000152587890625px); top: calc(50% - 27px - 3.5px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1197:4;495:30" style="width: 243.99996948242188px; position: static; left: calc(50% - 121.99998474121094px - 0px); height: 46px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">It’s a web tool for training AI models, no coding required.</span></div></div><div id="1197:15" style="z-index: 21; transform: matrix(0.9942449331283569,0.10713176429271698,-0.10713176429271698,0.9942449331283569,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 120px - -2px); top: calc(50% - 13px - -255px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; opacity: 0.6000000238418579; overflow: hidden; border-radius: 4px 4px 4px 4px; "><div id="I1197:15;578:15" style="position: static; left: calc(50% - 114px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://twitter.com/search?q=%23teachablemachine&f=live">See what people have made with it.</a></span></div></div><div id="1197:12" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 282.9999694824219px; position: absolute; left: calc(50% - 141.49998474121094px - -0.4999847412109375px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1197:12;495:30" style="width: 270.9999694824219px; position: static; left: calc(50% - 135.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="13">Before that, </span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="30">I led design for </span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="47"> <a href="https://teachablemachine.withgoogle.com/">Teachable Machine</a></span><span key="end">:</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1201:6" style="transform: matrix(0.9942448139190674,-0.10713174939155579,0.10713174939155579,0.9942448139190674,0,0); transform-origin: 0% 0%; width: 655.7010498046875px; position: absolute; left: calc(50% - 327.85052490234375px - 61.14947509765625px); height: 515.0559692382812px; top: calc(50% - 257.5279846191406px - -62.774383544921875px); background-image: url(./images/lens_IO); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 2px 2px 2px 2px; "></div><div id="1201:9" style="z-index: 21; transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 233.99996948242188px; position: absolute; left: calc(50% - 116.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:9;495:30" style="width: 221.99996948242188px; position: static; left: calc(50% - 110.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="25">I helped design & launch </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="end"> <a href="https://lens.google.com/">Google Lens:</a></span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="705:2" style="transform: matrix(0.9957780838012695,-0.09179326146841049,0.09179326146841049,0.9957780838012695,0,0); transform-origin: 0% 0%; width: 309.90411376953125px; position: absolute; right: -8.42864990234375px; height: 169.4788055419922px; bottom: 64.63725280761719px; background-image: url(./images/payinterns); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="705:3" style="transform: matrix(0.9971057772636414,0.07602643966674805,-0.07602643966674805,0.9971057772636414,0,0); transform-origin: 0% 0%; width: 320.6974182128906px; position: absolute; left: -26.869298934936523px; height: 172.5336151123047px; top: calc(50% - 86.26680755615234px - 4.901344299316406px); background-image: url(./images/welcomeback); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="705:4" style="transform: matrix(0.9889853000640869,-0.14801350235939026,0.14801350235939026,0.9889853000640869,0,0); transform-origin: 0% 0%; width: 284.3169250488281px; position: absolute; right: -7.135589599609375px; height: 176.09259033203125px; top: 99.38426208496094px; background-image: url(./images/vote_screenshot); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="705:6" style="z-index: 21; transform: matrix(0.9889854192733765,-0.14801351726055145,0.14801351726055145,0.9889854192733765,0,0); transform-origin: 0% 0%; width: 187.62852478027344px; position: absolute; right: 127.0031967163086px; top: 230.17840576171875px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:6;495:30" style="width: 175.62852478027344px; position: static; left: calc(50% - 87.81426239013672px - 0px); height: 18px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://techcrunch.com/2018/11/06/googles-doodle-commands-you-to-go-vote/">Google’s first voting doodle</a></span></div></div><div id="705:7" style="z-index: 21; transform: matrix(0.9957782030105591,-0.09179326891899109,0.09179326891899109,0.9957782030105591,0,0); transform-origin: 0% 0%; width: 201.4622344970703px; position: absolute; right: 109.00833892822266px; bottom: 92.9647216796875px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:7;495:30" style="width: 189.4622344970703px; position: static; left: calc(50% - 94.73111724853516px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://payinterns.nyc">A list of NYC offices that pay creative interns a living wage</a></span></div></div><div id="705:9" style="z-index: 21; transform: matrix(0.9971058964729309,0.07602645456790924,-0.07602645456790924,0.9971058964729309,0,0); transform-origin: 0% 0%; width: 192.53700256347656px; position: absolute; left: 114.38227844238281px; top: calc(50% - 23px - -31.126953125px); display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I705:9;495:30" style="width: 180.53700256347656px; position: static; left: calc(50% - 90.26850128173828px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="https://welcomeback.nyc">A web store where only one person can shop at a time</a></span></div></div><div id="1201:16" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 57.5px - 0.5000152587890625px); top: 33px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:16;578:15" style="position: static; left: calc(50% - 51.5px - 0px); height: 31px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And also:</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="709:3" style="transform: matrix(0.9971598386764526,0.07531432807445526,-0.07531432807445526,0.9971598386764526,0,0); transform-origin: 0% 0%; width: 350.08770751953125px; position: absolute; left: -59.18896484375px; height: 183.3792724609375px; bottom: 80.820556640625px; background-image: url(./images/covid); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="709:2" style="transform: matrix(0.9985552430152893,-0.053734373301267624,0.053734373301267624,0.9985552430152893,0,0); transform-origin: 0% 0%; width: 328.3610534667969px; position: absolute; right: -6.607513427734375px; height: 167.78306579589844px; top: calc(50% - 83.89153289794922px - -13.760948181152344px); background-image: url(./images/enhance); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="704:0" style="transform: matrix(0.9946823120117188,0.10299064218997955,-0.10299064218997955,0.9946823120117188,0,0); transform-origin: 0% 0%; width: 240.78590393066406px; position: absolute; left: -10.297911643981934px; height: 192.90232849121094px; top: 67.86387634277344px; background-image: url(./images/lens2); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="721:0" style="transform: matrix(0.9946824312210083,0.10299064964056015,-0.10299064964056015,0.9946824312210083,0,0); transform-origin: 0% 0%; width: 188.84039306640625px; position: absolute; left: 110.73759460449219px; top: 199px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:0;495:30" style="width: 176.84039306640625px; position: static; left: calc(50% - 88.42019653320312px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end">Prototyping the first Google Home devices w/ screens</span></div></div><div id="721:3" style="z-index: 21; transform: matrix(0.9985553622245789,-0.05373437702655792,0.05373437702655792,0.9985553622245789,0,0); transform-origin: 0% 0%; position: absolute; right: 125.10746765136719px; top: calc(50% - 14px - -60.414093017578125px); display: flex; flex-direction: row; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:3;578:15" style="position: static; left: calc(50% - 109.5px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://enhance.computer">A cyberpunk detective voice game</a></span></div></div><div id="721:5" style="z-index: 21; transform: matrix(0.9971599578857422,0.07531433552503586,-0.07531433552503586,0.9971599578857422,0,0); transform-origin: 0% 0%; width: 178.79794311523438px; position: absolute; left: 145.4644775390625px; bottom: 89.99432373046875px; display: flex; flex-direction: column; padding: 4px 6px 6px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I721:5;495:30" style="width: 166.79794311523438px; position: static; left: calc(50% - 83.39897155761719px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="end"><a href="http://google.com/covid19/mobility/">Global mobility reports for understanding COVID</a></span></div></div><div id="1201:19" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 32px - 0.5px); top: 33px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:19;578:15" style="position: static; left: calc(50% - 26px - 0px); height: 31px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And:</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1201:0" style="transform: matrix(0.9540171027183533,0.2997521460056305,-0.2997521460056305,0.9540171027183533,0,0); transform-origin: 0% 0%; width: 388.14288330078125px; position: absolute; left: calc(50% - 194.07144165039062px - 85.75747680664062px); height: 389.6709899902344px; top: -40.45792770385742px; background-image: url(./images/BeyBlade); background-size: cover; "></div><div id="1201:13" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 231.99996948242188px; position: absolute; left: calc(50% - 115.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1201:13;495:30" style="width: 219.99996948242188px; position: static; left: calc(50% - 109.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I also used to make dumb t-shirts:</span></div></div><div id="1201:2" style="transform: matrix(0.8501306772232056,0.5265717506408691,-0.5265717506408691,0.8501306772232056,0,0); transform-origin: 0% 0%; width: 434.91143798828125px; position: absolute; left: calc(50% - 217.45571899414062px - -10.341907307505608px); height: 436.5714416503906px; top: 338px; background-image: url(./images/Infinitywar); background-size: cover; "></div><div id="1201:1" style="transform: matrix(0.9515489339828491,-0.30749738216400146,0.30749738216400146,0.9515489339828491,0,0); transform-origin: 0% 0%; width: 410.4928894042969px; position: absolute; left: calc(50% - 205.24644470214844px - -114.24644470214844px); height: 410.4928894042969px; top: 275.282958984375px; background-image: url(./images/Grimes); background-size: cover; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1865:80" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 231.99996948242188px; position: absolute; left: calc(50% - 115.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1865:80;495:30" style="width: 219.99996948242188px; position: static; left: calc(50% - 109.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I’ve designed some book covers:</span></div></div><div id="1865:85" style="transform: matrix(0.9825518727302551,-0.1859886199235916,0.1859886199235916,0.9825518727302551,0,0); transform-origin: 0% 0%; width: 379.10052490234375px; position: absolute; left: calc(50% - 189.55026245117188px - 37.449737548828125px); height: 438.7815246582031px; top: calc(50% - 219.39076232910156px - -39.39076232910156px); background-image: url(./images/stack_smol); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1865:87" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 231.99996948242188px; position: absolute; left: calc(50% - 115.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1865:87;495:30" style="width: 219.99996948242188px; position: static; left: calc(50% - 109.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Even some book cover systems:</span></div></div><div id="1865:90" style="transform: matrix(0.9882276058197021,0.1529906541109085,-0.1529906541109085,0.9882276058197021,0,0); transform-origin: 0% 0%; width: 416.0060729980469px; position: absolute; left: calc(50% - 208.00303649902344px - -31.002933502197266px); height: 373.7554626464844px; top: calc(50% - 186.8777313232422px - 30.122268676757812px); background-image: url(./images/cosmos_anniversary_smol_1); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1866:9" style="transform: matrix(0.9741045832633972,0.2260979861021042,-0.2260979861021042,0.9741045832633972,0,0); transform-origin: 0% 0%; width: 407px; position: absolute; left: -11.7275390625px; height: 271px; top: -13px; background-image: url(./images/documentation22314); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="1866:5" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 257.9999694824219px; position: absolute; left: calc(50% - 128.99998474121094px - 0.0000152587890625px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1866:5;495:30" style="width: 245.99996948242188px; position: static; left: calc(50% - 122.99998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And occasionally the inside of some books</span></div></div><div id="1866:13" style="transform: matrix(0.9901300072669983,-0.1401517689228058,0.1401517689228058,0.9901300072669983,0,0); transform-origin: 0% 0%; width: 399px; position: absolute; left: calc(50% - 199.5px - 16.5px); height: 266px; top: calc(50% - 133px - -69.92056274414062px); background-image: url(./images/documentation25924); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="1866:10" style="transform: matrix(0.9659258127212524,0.258819043636322,-0.258819043636322,0.9659258127212524,0,0); transform-origin: 0% 0%; width: 390.5374755859375px; position: absolute; right: -91.8284912109375px; height: 259.9926452636719px; bottom: 10.007354736328125px; background-image: url(./images/documentation27428); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(246, 178, 184, 1) 0%, rgba(228, 157, 191, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1866:23" style="width: 845px; position: absolute; left: 21px; height: 555px; bottom: -17px; background-image: url(./images/screenshot); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 8px 8px 8px 8px; "></div><div id="1866:17" style="transform: matrix(1.0000001192092896,0,0,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 248.99996948242188px; position: absolute; left: calc(50% - 124.49998474121094px - -0.4999847412109375px); top: 33px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1866:17;495:30" style="width: 236.99996948242188px; position: static; left: calc(50% - 118.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">I also sold my digital privacy in 2015, lol</span></div></div><div id="1866:21" style="z-index: 21; transform: matrix(0.9943346977233887,-0.10629584640264511,0.10629584640264511,0.9943346977233887,0,0); transform-origin: 0% 0%; width: 248.99996948242188px; position: absolute; left: calc(50% - 124.49998474121094px - -36.49998474121094px); bottom: 283.53235626220703px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1866:21;495:30" style="width: 236.99996948242188px; position: static; left: calc(50% - 118.49998474121094px - 0px); height: 62px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(255, 255, 255, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="20"> <a href="http://buymyprivacy.com">You can still buy it</a></span><span key="end"> if you want, i think?</span></div></div></section>']},{name:"Thoughts",stories:['<section class="frame" style="overflow: hidden; background: linear-gradient(-3.141592653589793rad, rgba(178, 242, 246, 1) 0%, rgba(157, 186, 228, 1) 100%);  width:100%; height:100%; display:block;" ><div id="752:2" style="transform: matrix(0.9916291832923889,0.12911826372146606,-0.12911826372146606,0.9916291832923889,0,0); transform-origin: 0% 0%; width: 262.7255554199219px; position: absolute; left: -10.938142776489258px; height: 164.80056762695312px; top: 82.84492492675781px; background-image: url(./images/markets); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="752:3" style="transform: matrix(0.9980056881904602,0.06312429904937744,-0.06312429904937744,0.9980056881904602,0,0); transform-origin: 0% 0%; width: 272.24981689453125px; position: absolute; left: -16.914932250976562px; height: 175.60702514648438px; bottom: 68.48211669921875px; background-image: url(./images/cars); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="752:4" style="transform: matrix(0.9903979301452637,-0.13824567198753357,0.13824567198753357,0.9903979301452637,0,0); transform-origin: 0% 0%; width: 266.87841796875px; position: absolute; right: -36.905487060546875px; height: 161.26271057128906px; top: calc(50% - 80.63135528564453px - -24.52613067626953px); background-image: url(./images/infographic); background-size: cover; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.18000000715255737); border-radius: 4px 4px 4px 4px; "></div><div id="752:5" style="transform: matrix(0.9916293025016785,0.12911827862262726,-0.12911827862262726,0.9916293025016785,0,0); transform-origin: 0% 0%; width: 217.27194213867188px; position: absolute; left: 74.89610290527344px; top: 203.74026489257812px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:5;495:30" style="width: 205.27194213867188px; position: static; left: calc(50% - 102.63597106933594px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Global accountability structures outside of financial markets</span></div></div><div id="752:6" style="transform: matrix(0.9980058073997498,0.06312430649995804,-0.06312430649995804,0.9980058073997498,0,0); transform-origin: 0% 0%; width: 193.99996948242188px; position: absolute; left: 127.7774658203125px; bottom: 90.00000381469727px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:6;495:30" style="width: 181.99996948242188px; position: static; left: calc(50% - 90.99998474121094px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Cities being planned around the infernal automobile</span></div></div><div id="752:7" style="transform: matrix(0.9903980493545532,-0.13824568688869476,0.13824568688869476,0.9903980493545532,0,0); transform-origin: 0% 0%; position: absolute; right: 137px; top: calc(50% - 13px - -79.17794799804688px); display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:7;578:15" style="position: static; left: calc(50% - 53px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Systems literacy</span></div></div><div id="752:8" style="width: 253px; position: absolute; left: calc(50% - 126.5px - 0.5px); top: 50px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; overflow: hidden; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I752:8;495:30" style="width: 241px; position: static; left: calc(50% - 120.5px - 0px); height: 46px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Here are some big problems I think need solving:</span></div></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-2.356194490192345rad, rgba(178, 242, 246, 1) 0%, rgba(157, 186, 228, 1) 100%);  width:100%; height:100%; display:block;" ><div id="799:47" style="transform: matrix(0.9915580153465271,0.12966495752334595,-0.12966495752334595,0.9915580153465271,0,0); transform-origin: 0% 0%; position: absolute; right: 10.62872314453125px; top: 158px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:47;578:15" style="position: static; left: calc(50% - 127px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(215, 255, 233, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Capital inheritance should be abolished</span></div></div><div id="800:11" style="transform: matrix(0.9875085949897766,-0.15756569802761078,0.15756569802761078,0.9875085949897766,0,0); transform-origin: 0% 0%; position: absolute; left: 39.96807861328125px; top: 132.56166076660156px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I800:11;578:15" style="position: static; left: calc(50% - 76px - 0px); height: 18px; top: 4px; flex: none; flex-grow: 0; color: rgba(255, 218, 221, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Meritocracy is a fantasy</span></div></div><div id="799:48" style="z-index: 21; transform: matrix(0.968247652053833,-0.24999360740184784,0.24999360740184784,0.968247652053833,0,0); transform-origin: 0% 0%; width: 267.3401184082031px; position: absolute; right: 12.660125732421875px; top: calc(50% - 31px - -16.917572021484375px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:48;495:30" style="width: 255.34011840820312px; position: static; left: calc(50% - 127.67005920410156px - 0px); height: 54px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(246, 209, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="87">Cars force cities to compromise community and livability. Subsidizing them the way the </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; color: rgba(246, 209, 255, 1); " key="96"> <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3345366">U.S. does</a></span><span key="end"> is abhorent</span></div></div><div id="800:13" style="transform: matrix(0.9980058073997498,0.06312430649995804,-0.06312430649995804,0.9980058073997498,0,0); transform-origin: 0% 0%; width: 191.3538055419922px; position: absolute; left: 15.049957275390625px; bottom: 232px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I800:13;495:30" style="width: 179.3538055419922px; position: static; left: calc(50% - 89.6769027709961px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(249, 214, 214, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Food, health, shelter and education are fundamental rights and markets can’t provide them to everyone</span></div></div><div id="801:2" style="transform: matrix(0.9943656921386719,-0.10600520670413971,0.10600520670413971,0.9943656921386719,0,0); transform-origin: 0% 0%; width: 254.84788513183594px; position: absolute; right: 26.608932495117188px; bottom: 72.98480224609375px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I801:2;495:30" style="width: 242.84788513183594px; position: static; left: calc(50% - 121.42394256591797px - 0px); height: 108px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(187, 255, 255, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Human intelligence is not exceptional; there are many other types of information organization  better at solving different problems. We are ripe with cognitive flaws and biases, especially at scale</span></div></div><div id="799:49" style="transform: matrix(0.9903980493545532,-0.13824568688869476,0.13824568688869476,0.9903980493545532,0,0); transform-origin: 0% 0%; width: 210.4332733154297px; position: absolute; left: 15px; top: calc(50% - 40px - 76.90852355957031px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(0, 0, 0, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:49;495:30" style="width: 198.4332733154297px; position: static; left: calc(50% - 99.21663665771484px - 0px); height: 72px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(220, 255, 207, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">Traditional Westphalian nation-states are ill-equipped to solve modern problems. Borders should be abolished</span></div></div><div id="799:50" style="position: absolute; left: calc(50% - 112.5px - 0px); top: 50px; display: flex; flex-direction: row; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I799:50;578:15" style="position: static; left: calc(50% - 106.5px - 0px); height: 23px; top: 4px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And some current beliefs:</span></div></div><div id="808:1" style="transform: matrix(0.6923969388008118,-0.7215167880058289,0.7215167880058289,0.6923969388008118,0,0); transform-origin: 0% 0%; position: absolute; left: 244.82431030273438px; height: 54px; bottom: 209.21377563476562px; color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:2" style="transform: matrix(0.9943564534187317,-0.10609052330255508,0.10609052330255508,0.9943564534187317,0,0); transform-origin: 0% 0%; position: absolute; right: 293px; height: 42px; bottom: 90.544189453125px; color: rgba(0, 0, 0, 1); font-size: 42px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:3" style="transform: matrix(0.24094675481319427,-0.970538318157196,0.970538318157196,0.24094675481319427,0,0); transform-origin: 0% 0%; position: absolute; left: 236.34732055664062px; height: 44px; top: calc(50% - 22px - 70.948974609375px); color: rgba(0, 0, 0, 1); font-size: 44px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:5" style="transform: matrix(0.9861655235290527,0.16576355695724487,-0.16576355695724487,0.9861655235290527,0,0); transform-origin: 0% 0%; position: absolute; right: 305.3640441894531px; height: 34px; top: calc(50% - 17px - -8px); color: rgba(0, 0, 0, 1); font-size: 34px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div><div id="808:4" style="transform: matrix(0.9844132661819458,0.1758708953857422,-0.1758708953857422,0.9844132661819458,0,0); transform-origin: 0% 0%; position: absolute; right: 142.789306640625px; height: 41px; top: 97px; color: rgba(0, 0, 0, 1); font-size: 41px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">✨</span></div></section>','<section class="frame" style="overflow: hidden; background: linear-gradient(-2.356194490192345rad, rgba(178, 242, 246, 1) 0%, rgba(157, 186, 228, 1) 100%);  width:100%; height:100%; display:block;" ><div id="1797:8" style="z-index: 21; width: 312px; position: absolute; left: calc(50% - 156px - 0px); top: calc(50% - 70px - -9px); display: flex; flex-direction: column; padding: 8px 8px 8px 8px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I1797:8;495:30" style="width: 296px; position: static; left: calc(50% - 148px - 0px); height: 124px; top: 8px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="45">I’m currently working on a city planning MMO </span><span key="61">in my spare time</span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="63">. </span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="80"> <a href="https://github.com/warronbebster/mayor_game">Here’s the github</a></span><span style="font-size: 24px; font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="end"> if you’re curious.</span></div></div><div id="1797:12" style="transform: matrix(0.8067948222160339,-0.5908317565917969,0.5908317565917969,0.8067948222160339,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 27px - 125px); height: 54px; top: calc(50% - 27px - 125.65606689453125px); color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">🏙</span></div><div id="1797:16" style="transform: matrix(0.9114494323730469,0.4114121198654175,-0.4114121198654175,0.9114494323730469,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 27px - -129.21630859375px); height: 54px; top: calc(50% - 27px - 131px); color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">🛠</span></div><div id="1797:14" style="transform: matrix(0.9600539207458496,0.27981507778167725,-0.27981507778167725,0.9600539207458496,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 27px - 26.366455078125px); height: 54px; top: calc(50% - 27px - 116.03744506835938px); color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">💻</span></div><div id="1797:15" style="transform: matrix(0.9606214165687561,-0.27786049246788025,0.27786049246788025,0.9606214165687561,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 27px - -40.56097412109375px); height: 54px; top: calc(50% - 27px - 154.9955291748047px); color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">🕹</span></div></section>']},{name:"This Site",stories:['<section class="frame" style="overflow: hidden; background-color: rgba(229, 229, 229, 1); border: 1px solid rgba(167, 167, 167, 1);  width:100%; height:100%; display:block;" ><div id="759:0" style="width: 337px; position: absolute; left: calc(50% - 168.5px - 0.5px); height: 196px; top: calc(50% - 98px - 6px); background-image: url(./images/figma); background-size: cover; border-radius: 2px 2px 2px 2px; "></div><div id="754:5" style="z-index: 21; transform: matrix(1.0000001192092896,-1.3877787807814457e-17,1.3877787807814457e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; width: 217.27194213867188px; position: absolute; left: calc(50% - 108.63597106933594px - 0.3640289306640625px); top: calc(50% - 22px - -92px); display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I754:5;495:30" style="width: 205.27194213867188px; position: static; left: calc(50% - 102.63597106933594px - 0px); height: 36px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="21"> <a href="https://bit.ly/2SqieMK">Here’s the Figma file</a></span><span key="end"> if you want a peek under the hood.</span></div></div><div id="761:56" style="z-index: 21; transform: matrix(1.0000001192092896,-2.7755578924351364e-17,2.7755578924351364e-17,1.0000001192092896,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 121.5px - 0.5px); height: 16px; bottom: 99.9681396484375px; opacity: 0.5; color: rgba(0, 0, 0, 1); font-size: 12px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="4">And </span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; text-decoration-line: underline; " key="14"> <a href="https://github.com/warronbebster/bwebsite">the github</a></span><span key="end"> if you wanna go even deeper.</span></div><div id="754:8" style="width: 284px; position: absolute; left: calc(50% - 142px - 0px); top: 74px; display: flex; flex-direction: column; padding: 4px 6px 4px 6px; justify-content: flex-start; align-items: flex-start; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="I754:8;495:30" style="width: 272px; position: static; left: calc(50% - 136px - 0px); height: 69px; top: 4px; flex: none; align-self: stretch; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: left; font-style: normal; line-height: 125%; "><span key="end">This site is built from scratch and updates live from a Figma file, so I can update it whenever.</span></div></div><div id="761:76" style="transform: matrix(0.9293728470802307,-0.3691423535346985,0.3691423535346985,0.9293728470802307,0,0); transform-origin: 0% 0%; width: 50px; position: absolute; left: 37px; height: 50px; top: calc(50% - 25px - 101.54287719726562px); overflow: hidden; background-color: rgba(30, 30, 30, 1); border-radius: 8px 8px 8px 8px; "><div id="761:77" style="width: 22px; position: absolute; left: calc(50% - 11px - 0px); height: 34px; top: calc(50% - 17px - 0px); background-image: url(./images/figmaLogo); background-size: cover; "></div></div></section>']},{name:"Contact",stories:['<section class="frame" style="overflow: hidden; background-image: url(./images/!contact); background-size: cover;  width:100%; height:100%; display:block;" ><div id="583:1" style="z-index: 21; position: absolute; left: calc(50% - 75px - 0.5px); top: calc(50% - 17.5px - 4.5px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="583:2" style="position: static; left: calc(50% - 69px - 0px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="1">@</span><span key="end"><a href="https://twitter.com/WarronBebster">warronbebster</a></span></div></div><div id="583:3" style="z-index: 21; position: absolute; left: calc(50% - 89.5px - 0.5px); top: calc(50% - 17.5px - -54.935028076171875px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="581:33" style="width: 23px; position: static; left: 6px; height: 23px; top: 6px; flex: none; flex-grow: 0; margin-right: 6px; background-image: url(./images/ig); background-size: cover; "></div><div id="583:4" style="position: static; left: calc(50% - 69px - -14.5px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="1">@</span><span key="end"><a href="https://www.instagram.com/barronwebster/">barronwebster</a></span></div></div><div id="583:5" style="position: absolute; left: calc(50% - 115px - 0.5px); top: calc(50% - 17.5px - -113.93502807617188px); display: flex; flex-direction: row; padding: 6px 6px 6px 6px; justify-content: flex-start; align-items: center; background-color: rgba(255, 255, 255, 1); box-shadow: 0px 3px 8px rgba(76, 77, 78, 0.4000000059604645); border-radius: 4px 4px 4px 4px; "><div id="583:6" style="position: static; left: calc(50% - 109px - 0px); height: 23px; top: 6px; flex: none; flex-grow: 0; color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; text-decoration-line: underline; "><span key="5">hello</span><span style="font-family: undefined, IBM Plex Sans, sans-serif; font-style: normal; " key="6">@</span><span key="end">barronwebster.com</span></div></div><div id="785:44" style="transform: matrix(0.9876883625984192,-0.15643446147441864,0.15643446147441864,0.9876883625984192,0,0); transform-origin: 0% 0%; position: absolute; left: calc(50% - 35.5px - 1.0786285400390625px); height: 31px; top: 156.1741485595703px; color: rgba(0, 0, 0, 1); font-size: 24px; font-weight: 500; font-family: IBM Plex Sans, IBM Plex Sans, sans-serif; text-align: center; font-style: normal; line-height: 125%; "><span key="end">say hi!</span></div></section>']}];function dt(e){let n;return{c(){n=c("section"),n.textContent="loading…"},m(t,e){x(t,n,e)},p:t,d(t){t&&d(n)}}}function ft(t){let e;return{c(){e=new w(t[0],null)},m(t,n){e.m(t,n)},p(t,n){1&n&&e.p(t[0])},d(t){t&&e.d()}}}function ct(e){let n,i;function o(t,e){return t[2]?ft:dt}let r=o(e),a=r(e);return{c(){n=c("div"),a.c(),y(n,"class",i="story "+e[1]+"  svelte-iitfkz")},m(t,e){x(t,n,e),a.m(n,null)},p(t,[e]){r===(r=o(t))&&a?a.p(t,e):(a.d(1),a=r(t),a&&(a.c(),a.m(n,null))),2&e&&i!==(i="story "+t[1]+"  svelte-iitfkz")&&y(n,"class",i)},i:t,o:t,d(t){t&&d(n),a.d()}}}function gt(t,e,n){let{storyContent:i="<section>loading…</section"}=e,{current:o=!1}=e,{nextCover:r=!1}=e,{next:a=!1}=e,{prev:s=!1}=e,l="none",p=!1;var x;return x=()=>{a?(n(1,l="plus1"),n(2,p=!0)):o?(n(1,l="currentStory"),n(2,p=!0)):s?(n(1,l="minus1"),n(2,p=!0)):n(1,l="none"),r&&(n(2,p=!0),n(1,l+=" nextCover"))},M().$$.before_update.push(x),t.$set=t=>{"storyContent"in t&&n(0,i=t.storyContent),"current"in t&&n(3,o=t.current),"nextCover"in t&&n(4,r=t.nextCover),"next"in t&&n(5,a=t.next),"prev"in t&&n(6,s=t.prev)},[i,l,p,o,r,a,s]}class ht extends J{constructor(t){super(),K(this,t,gt,ct,r,{storyContent:0,current:3,nextCover:4,next:5,prev:6})}}function ut(t,e,n){const i=t.slice();return i[7]=e[n],i[9]=n,i}function mt(t){let e,n,i,o,r,a=t[7].name+"";function s(...e){return t[4](t[9],...e)}return{c(){e=c("li"),n=g(a),i=h(),y(e,"class",o=" navItem "+(t[0]==t[9]?"activeNavItem":"inactiveNavItem")+"\n        "+(t[1]?"visible":t[0]!==t[9]?"hidden":"visible")+"\n         svelte-iymz21")},m(t,o,a){x(t,e,o),p(e,n),p(e,i),a&&r(),r=m(e,"click",s)},p(n,i){t=n,3&i&&o!==(o=" navItem "+(t[0]==t[9]?"activeNavItem":"inactiveNavItem")+"\n        "+(t[1]?"visible":t[0]!==t[9]?"hidden":"visible")+"\n         svelte-iymz21")&&y(e,"class",o)},d(t){t&&d(e),r()}}}function bt(e){let n,o,r,a,s=xt,g=[];for(let t=0;t<s.length;t+=1)g[t]=mt(ut(e,s,t));return{c(){n=c("nav"),o=c("ol");for(let t=0;t<g.length;t+=1)g[t].c();y(o,"class","svelte-iymz21"),y(n,"class",r=l(e[1]?"open":"closed")+" svelte-iymz21")},m(t,r,s){x(t,n,r),p(n,o);for(let t=0;t<g.length;t+=1)g[t].m(o,null);s&&i(a),a=[m(n,"mouseover",e[5]),m(n,"mouseleave",e[6])]},p(t,[e]){if(15&e){let n;for(s=xt,n=0;n<s.length;n+=1){const i=ut(t,s,n);g[n]?g[n].p(i,e):(g[n]=mt(i),g[n].c(),g[n].m(o,null))}for(;n<g.length;n+=1)g[n].d(1);g.length=s.length}2&e&&r!==(r=l(t[1]?"open":"closed")+" svelte-iymz21")&&y(n,"class",r)},i:t,o:t,d(t){t&&d(n),f(g,t),i(a)}}}function yt(t,e,n){let{projectIndex:i=0}=e,{navOpen:o=!1}=e;const r=S();function a(t){r("message",{open:t})}return t.$set=t=>{"projectIndex"in t&&n(0,i=t.projectIndex),"navOpen"in t&&n(1,o=t.navOpen)},[i,o,r,a,t=>{window.innerWidth<640?(o&&r("project",t),a(i==t&&!o)):r("project",t)},()=>{window.innerWidth>640&&a(!0)},()=>{window.innerWidth>640&&a(!1)}]}class vt extends J{constructor(t){super(),K(this,t,yt,bt,a,{projectIndex:0,navOpen:1})}}const{window:wt}=R;function kt(t,e,n){const i=t.slice();return i[34]=e[n],i[36]=n,i}function It(t,e,n){const i=t.slice();return i[34]=e[n],i[38]=n,i}function Mt(t,e,n){const i=t.slice();return i[30]=e[n].name,i[31]=e[n].stories,i[33]=n,i}function St(t){let e,n=t[31],i=[];for(let e=0;e<n.length;e+=1)i[e]=zt(It(t,n,e));return{c(){e=c("div");for(let t=0;t<i.length;t+=1)i[t].c();y(e,"id","indicators"),y(e,"class","svelte-n01c88")},m(t,n){x(t,e,n);for(let t=0;t<i.length;t+=1)i[t].m(e,null)},p(t,o){if(41&o[0]){let r;for(n=t[31],r=0;r<n.length;r+=1){const a=It(t,n,r);i[r]?i[r].p(a,o):(i[r]=zt(a),i[r].c(),i[r].m(e,null))}for(;r<i.length;r+=1)i[r].d(1);i.length=n.length}},d(t){t&&d(e),f(i,t)}}}function Pt(e){let n;return{c(){n=c("div"),y(n,"class","nextIndicators svelte-n01c88")},m(t,e){x(t,n,e)},p:t,d(t){t&&d(n)}}}function Bt(t){let e,n,i,o;return{c(){e=c("div"),n=c("div"),o=h(),y(n,"id","loadingBar"),y(n,"class",i=l(t[3]||t[5]?"paused":"no")+" svelte-n01c88"),y(e,"id","currentIndicator"),y(e,"class","svelte-n01c88")},m(t,i){x(t,e,i),p(e,n),p(e,o)},p(t,e){40&e[0]&&i!==(i=l(t[3]||t[5]?"paused":"no")+" svelte-n01c88")&&y(n,"class",i)},d(t){t&&d(e)}}}function jt(e){let n;return{c(){n=c("div"),y(n,"class","svelte-n01c88")},m(t,e){x(t,n,e)},p:t,d(t){t&&d(n)}}}function zt(t){let e;function n(t,e){return t[0].story>t[38]?jt:t[0].story==t[38]?Bt:Pt}let i=n(t),o=i(t);return{c(){o.c(),e=u()},m(t,n){o.m(t,n),x(t,e,n)},p(t,r){i===(i=n(t))&&o?o.p(t,r):(o.d(1),o=i(t),o&&(o.c(),o.m(e.parentNode,e)))},d(t){o.d(t),t&&d(e)}}}function $t(t){let e;const n=new ht({props:{storyContent:t[34],current:t[0].project==t[33]&&t[0].story==t[36],next:t[6].project==t[33]&&t[6].story==t[36],prev:t[7].project==t[33]&&t[7].story==t[36],nextCover:t[33]==t[8]?t[36]==t[1][t[8]]:t[33]==t[9]&&t[36]==t[1][t[9]]}});return{c(){Y(n.$$.fragment)},m(t,i){U(n,t,i),e=!0},p(t,e){const i={};1&e[0]&&(i.current=t[0].project==t[33]&&t[0].story==t[36]),64&e[0]&&(i.next=t[6].project==t[33]&&t[6].story==t[36]),128&e[0]&&(i.prev=t[7].project==t[33]&&t[7].story==t[36]),770&e[0]&&(i.nextCover=t[33]==t[8]?t[36]==t[1][t[8]]:t[33]==t[9]&&t[36]==t[1][t[9]]),n.$set(i)},i(t){e||(X(n.$$.fragment,t),e=!0)},o(t){F(n.$$.fragment,t),e=!1},d(t){V(n,t)}}}function _t(t){let e,n,i,o,r,a,s=t[0].project==t[33]&&St(t),l=t[31],g=[];for(let e=0;e<l.length;e+=1)g[e]=$t(kt(t,l,e));const u=t=>F(g[t],1,1,()=>{g[t]=null});return{c(){e=c("div"),s&&s.c(),n=h();for(let t=0;t<g.length;t+=1)g[t].c();r=h(),y(e,"class",i="project "+(t[0].project==t[33]?"currentProject ":"")+(t[33]==t[8]?"nextProject ":"")+(t[33]==t[9]?"prevProject ":"")+" svelte-n01c88"),y(e,"style",o=(!t[3]||t[33]!=t[0].project&&t[33]!=t[8]&&t[33]!=t[9]?"":"transform: translateX("+(t[33]==t[9]?-100:t[33]==t[8]?100:0)+"%) rotateY("+(Math.min(Math.max(t[2]/4.2,-90),90)+(t[33]==t[8]?90:0)+(t[33]==t[9]?-90:0))+"deg) ;")+"\n        "+(t[0].project==t[33]?"transform-origin: center "+t[4]+";":"")+(t[8]==t[33]?"transform-origin: center left; ":" ")+(t[9]==t[33]?"transform-origin: center right; ":" ")+(t[3]?"transition: left 0s, transform 0s ":"transition: left .5s ease, transform .5s ease; "))},m(t,i){x(t,e,i),s&&s.m(e,null),p(e,n);for(let t=0;t<g.length;t+=1)g[t].m(e,null);x(t,r,i),a=!0},p(t,r){if(t[0].project==t[33]?s?s.p(t,r):(s=St(t),s.c(),s.m(e,n)):s&&(s.d(1),s=null),963&r[0]){let n;for(l=t[31],n=0;n<l.length;n+=1){const i=kt(t,l,n);g[n]?(g[n].p(i,r),X(g[n],1)):(g[n]=$t(i),g[n].c(),X(g[n],1),g[n].m(e,null))}for(G(),n=l.length;n<g.length;n+=1)u(n);H()}(!a||769&r[0]&&i!==(i="project "+(t[0].project==t[33]?"currentProject ":"")+(t[33]==t[8]?"nextProject ":"")+(t[33]==t[9]?"prevProject ":"")+" svelte-n01c88"))&&y(e,"class",i),(!a||797&r[0]&&o!==(o=(!t[3]||t[33]!=t[0].project&&t[33]!=t[8]&&t[33]!=t[9]?"":"transform: translateX("+(t[33]==t[9]?-100:t[33]==t[8]?100:0)+"%) rotateY("+(Math.min(Math.max(t[2]/4.2,-90),90)+(t[33]==t[8]?90:0)+(t[33]==t[9]?-90:0))+"deg) ;")+"\n        "+(t[0].project==t[33]?"transform-origin: center "+t[4]+";":"")+(t[8]==t[33]?"transform-origin: center left; ":" ")+(t[9]==t[33]?"transform-origin: center right; ":" ")+(t[3]?"transition: left 0s, transform 0s ":"transition: left .5s ease, transform .5s ease; ")))&&y(e,"style",o)},i(t){if(!a){for(let t=0;t<l.length;t+=1)X(g[t]);a=!0}},o(t){g=g.filter(Boolean);for(let t=0;t<g.length;t+=1)F(g[t]);a=!1},d(t){t&&d(e),s&&s.d(),f(g,t),t&&d(r)}}}function Et(t){let e,n,o,r,a,s,g;const u=new vt({props:{projectIndex:parseInt(t[0].project),navOpen:t[5]}});u.$on("message",t[10]),u.$on("project",t[11]);let w=xt,k=[];for(let e=0;e<w.length;e+=1)k[e]=_t(Mt(t,w,e));const I=t=>F(k[t],1,1,()=>{k[t]=null});return{c(){Y(u.$$.fragment),e=h(),n=c("div"),o=c("main");for(let t=0;t<k.length;t+=1)k[t].c();y(o,"style",r="transform: translateX("+(t[3]?Math.max(Math.min(1.1*t[2],460),-460):0)+"px);\n    "+(t[3]?"transition: transform 0s;":"transition: transform .5s ease;")),y(o,"class","svelte-n01c88"),v(n,"overflow","hidden"),v(n,"height","100vh"),v(n,"width","100vw"),v(n,"display","flex"),v(n,"align-items","center"),v(n,"justify-content","center"),v(n,"perspective","1080px"),v(n,"cursor","ew-resize"),y(n,"class",a=l(t[3]?"grabbing":"no")+" svelte-n01c88")},m(r,a,l){U(u,r,a),x(r,e,a),x(r,n,a),p(n,o);for(let t=0;t<k.length;t+=1)k[t].m(o,null);s=!0,l&&i(g),g=[m(wt,"keydown",t[15]),m(n,"mousedown",t[24]),m(n,"mousemove",t[25]),m(n,"mouseup",t[26]),m(n,"touchstart",b(t[27])),m(n,"touchmove",t[28],{passive:!0}),m(n,"touchend",b(t[29]))]},p(t,e){const i={};if(1&e[0]&&(i.projectIndex=parseInt(t[0].project)),32&e[0]&&(i.navOpen=t[5]),u.$set(i),1023&e[0]){let n;for(w=xt,n=0;n<w.length;n+=1){const i=Mt(t,w,n);k[n]?(k[n].p(i,e),X(k[n],1)):(k[n]=_t(i),k[n].c(),X(k[n],1),k[n].m(o,null))}for(G(),n=w.length;n<k.length;n+=1)I(n);H()}(!s||12&e[0]&&r!==(r="transform: translateX("+(t[3]?Math.max(Math.min(1.1*t[2],460),-460):0)+"px);\n    "+(t[3]?"transition: transform 0s;":"transition: transform .5s ease;")))&&y(o,"style",r),(!s||8&e[0]&&a!==(a=l(t[3]?"grabbing":"no")+" svelte-n01c88"))&&y(n,"class",a)},i(t){if(!s){X(u.$$.fragment,t);for(let t=0;t<w.length;t+=1)X(k[t]);s=!0}},o(t){F(u.$$.fragment,t),k=k.filter(Boolean);for(let t=0;t<k.length;t+=1)F(k[t]);s=!1},d(t){V(u,t),t&&d(e),t&&d(n),f(k,t),i(g)}}}function Ct(t,e){var n,i,o=e,r=e;this.pause=function(){window.clearTimeout(n),r-=Date.now()-i},this.clear=function(){window.clearTimeout(n)},this.resume=function(){i=Date.now(),window.clearTimeout(n),n=window.setTimeout(t,r)},this.reset=function(){i=Date.now(),r=o,window.clearTimeout(n),n=window.setTimeout(t,r)},this.resume()}function At(t,e,n){let i=[];for(const t of xt)i.push(0);let o,r,a,s,{params:l={project:0,story:0}}=e,p=0,x=0,d=!1,f="right",c=!0,g=!1;function h(t,e){!function(t){if(!t||t.length<1||"/"!=t.charAt(0)&&0!==t.indexOf("#/"))throw Error("Invalid parameter location");A().then(()=>{window.location.hash=("#"==t.charAt(0)?"":"#")+t})}(`/${t.toString()}/${e.toString()}`),s&&s.reset()}function u(t){"next"==t?h(w.project,w.story):"prev"==t?h(k.project,k.story):"nextProject"==t?h(I,i[I]):"prevProject"==t&&h(S,i[S])}function m(t){g?(n(5,g=!1),s.resume()):(s.pause(),n(3,d=!0),c=!1,o="touchstart"==t.type?Math.round(t.changedTouches[0].pageX):t.pageX,r=o,a=setTimeout(()=>{c=!0},300))}function b(t){r="touchmove"==t.type?Math.round(t.changedTouches[0].pageX):t.pageX,n(2,x=r-o),n(4,f=x>0?"left":"right")}function y(t){s.resume(),c?r>o+200?u("prevProject"):r<o-200&&u("nextProject"):r>o+100?u("prevProject"):r<o-100?u("nextProject"):Math.abs(x)<10&&(r>window.innerWidth/2?u("next"):u("prev")),a&&clearTimeout(a),n(3,d=!1),o=0,r=0,n(2,x=0)}var v;v=()=>{function t(t){"A"===(t=window.e||t).target.tagName&&(window.location.href=t.srcElement.href)}s=new Ct(()=>{u("next")},6e3),document.addEventListener?document.addEventListener("touchend",t,!1):document.attachEvent("onclick",t)},M().$$.on_mount.push(v),function(t){M().$$.on_destroy.push(t)}(()=>{s.clear(),s=null});let w,k,I,S;return t.$set=t=>{"params"in t&&n(0,l=t.params)},t.$$.update=()=>{1&t.$$.dirty[0]&&n(1,i[parseInt(l.project)]=parseInt(l.story),i),1&t.$$.dirty[0]&&n(6,w=function(t){let e={project:0,story:0};return Number.isInteger(parseInt(t.project))?(parseInt(t.project)>=xt.length||t<0||(t.story=parseInt(t.story),e.project=parseInt(t.project),e.story=parseInt(t.story),t.story<xt[t.project].stories.length-1?e.story++:t.project<xt.length-1?(e.project++,e.story=0):(e.story=0,e.project=0)),e):e}(l)),1&t.$$.dirty[0]&&n(7,k=function(t){let e={project:0,story:0};return Number.isInteger(parseInt(t.project))?(parseInt(t.project)>=xt.length||t<0||(t.story=parseInt(t.story),e.project=t.project,e.story=t.story,t.story>0?e.story--:t.project>0?(e.project--,e.story=xt[t.project-1].stories.length-1):(e.project=xt.length-1,e.story=xt[xt.length-1].stories.length-1)),e):e}(l)),1&t.$$.dirty[0]&&n(8,I=parseInt(l.project)<xt.length-1?parseInt(l.project)+1:0),1&t.$$.dirty[0]&&n(9,S=parseInt(l.project)>0?parseInt(l.project)-1:xt.length-1),65537&t.$$.dirty[0]&&parseInt(l.project)!=p&&(0==parseInt(l.project)?n(4,f=p==xt.length-1?"left":"right"):parseInt(l.project)==xt.length-1?n(4,f=0==p?"right":"left"):parseInt(l.project)>p?n(4,f="left"):n(4,f="right"),n(16,p=parseInt(l.project)))},[l,i,x,d,f,g,w,k,I,S,function(t){n(5,g=t.detail.open),s.pause()},function(t){h(t.detail,0),s.resume()},m,b,y,function(t){39==t.keyCode||32==t.keyCode||68==t.keyCode?u("next"):37!=t.keyCode&&8!=t.keyCode&&65!=t.keyCode||u("prev")},p,o,r,c,a,s,h,u,t=>{m(t)},t=>{d&&b(t)},t=>{d&&y()},t=>{m(t)},t=>{d&&b(t)},t=>{d&&y()}]}class Tt extends J{constructor(t){super(),K(this,t,At,Et,a,{params:0},[-1,-1])}}const Nt={"/":Tt,"/:project/:story":Tt,"*":Tt};function Ot(e){let n;const i=new pt({props:{routes:Nt}});return i.$on("routeLoaded",Dt),{c(){Y(i.$$.fragment)},m(t,e){U(i,t,e),n=!0},p:t,i(t){n||(X(i.$$.fragment,t),n=!0)},o(t){F(i.$$.fragment,t),n=!1},d(t){V(i,t)}}}function Dt(t){let e=t.detail.location.split("/");e.shift(),e[0]?Number.isInteger(parseInt(e[0]))?parseInt(e[0])>=xt.length||parseInt(e[0])<0?st("/"):2==e.length?Number.isInteger(parseInt(e[1]))?parseInt(e[1])>=xt[parseInt(e[0])].stories.length&&st("/"+e[0]+"/0"):st("/"+e[0]+"/0"):(e.length=1)&&st("/"+e[0]+"/0"):st("/"):st("/0/0")}return new class extends J{constructor(t){super(),K(this,t,null,Ot,r,{})}}({target:document.body})}();
>>>>>>> 6918b36803b809cd8840e350c0bfb70f68326851
//# sourceMappingURL=bundle.js.map
