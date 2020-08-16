
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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

    const figmaProject = [
    	{
    		name: 'Welcome',
    		stories: [
    			'<section class="frame" style="overflow: hidden; background-color: rgba(255, 193, 193, 1);  width:100%; height:100%; display:block;" ><div id="21:2" style="z-index: 21; transform: matrix(0.9612616896629333,-0.2756373882293701,0.27563732862472534,0.9612616896629333,0,0); transform-origin: 0% 0%; width: 128px; position: absolute; right: 33.270599365234375px; height: 78px; top: 177.15158081054688px; background-color: rgba(196, 196, 196, 1); "><div id="21:0" style="position: absolute; left: 13px; height: 18px; top: 11px; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 500; font-family: IBM Plex Sans; text-align: left; font-style: normal; line-height: 125%; "><span key="end"><a href="http://barronwebster.com">Inside another</a></span></div><div id="61:2" style="transform: matrix(0.9612616896629333,0.27563735842704773,-0.27563735842704773,0.9612616896629333,0,0); transform-origin: 0% 0%; width: 53px; position: absolute; left: 14.134858131408691px; height: 12px; top: 42.38649368286133px; background-color: rgba(170, 38, 38, 1); "></div></div><div id="106:0" style="z-index: 21; position: absolute; left: calc(50% - 130.5px - -0.5px); height: 18px; top: 350px; color: rgba(0, 0, 0, 1); font-size: 14px; font-weight: 400; font-family: IBM Plex Sans; text-align: left; font-style: normal; line-height: 125%; "><span style="font-weight: 500; font-family: IBM Plex Sans; font-style: normal; " key="12">Let’s try a </span><span style="font-size: 14px; font-weight: 500; font-family: IBM Plex Sans; font-style: normal; line-height: 125%; color: rgba(0, 68, 204, 1); " key="16"> <a href="http://barronwebster.com">link</a></span><span style="font-weight: 500; font-family: IBM Plex Sans; font-style: normal; " key="29"> inline in a </span><span style="font-weight: 700; font-family: IBM Plex Sans; font-style: normal; " key="end">text box boyyyy</span></div><div id="345:3" style="width: 208px; position: absolute; left: 43px; height: 104px; top: 552px; display: flex; flex-direction: row; padding: 14px 8px; justify-content: space-between; overflow: hidden; background-color: rgba(255, 255, 255, 1); "><div id="345:1" style="width: 31px; position: static; left: 8px; height: 47px; top: 14px; flex: none; align-self: flex-start; background-color: rgba(196, 196, 196, 1); "></div><div id="349:1" style="width: 31px; position: static; left: 55px; height: 76px; top: 14px; flex: none; align-self: center; background-color: rgba(196, 196, 196, 1); "></div><div id="345:4" style="width: 32px; position: static; left: 102px; height: 47px; top: 43px; flex: none; align-self: flex-end; background-color: rgba(114, 220, 143, 1); "></div><div id="345:2" style="width: 50px; position: static; left: 150px; height: 76px; top: 14px; flex: none; align-self: stretch; background-color: rgba(75, 163, 183, 1); "></div></div><div id="352:0" style="width: 104px; position: absolute; left: 43px; height: 156px; top: 54px; display: flex; flex-direction: column; padding: 14px 8px; justify-content: space-between; overflow: hidden; background-color: rgba(255, 255, 255, 1); "><div id="352:1" style="width: 31px; position: static; left: 8px; height: 20px; top: 14px; flex: none; align-self: flex-start; background-color: rgba(196, 196, 196, 1); "></div><div id="352:2" style="width: 88px; position: static; left: 8px; height: 15px; top: 50px; flex: none; align-self: center; background-color: rgba(196, 196, 196, 1); "></div><div id="352:3" style="width: 32px; position: static; left: 64px; height: 16px; top: 81px; flex: none; align-self: flex-end; background-color: rgba(114, 220, 143, 1); "></div><div id="352:4" style="width: 88px; position: static; left: 8px; height: 29px; top: 113px; flex: none; align-self: stretch; background-color: rgba(75, 163, 183, 1); "></div></div><div id="366:0" style="width: 128px; position: absolute; left: 261px; height: 128px; top: 407px; background-image: url(./images/bw_prof_red_1); background-size: cover; border-radius: 250px 250px 250px 250px; "></div><div id="392:0" style="width: 154px; position: absolute; left: 45px; height: 116px; top: 401px; overflow: hidden; background-color: rgba(255, 255, 255, 1); opacity: 0.30000001192092896; border-radius: 8px 8px 8px 8px; "><video autoplay loop muted style="width: 100%; height: auto; position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%)"><source src="./videos/test.mp4" type="video/mp4"/>Your browser does not support the video tag. I suggest you upgrade your browser.</video></div></section>',
    			'<section class="frame" style="overflow: hidden; background-color: rgba(255, 0, 0, 1);  width:100%; height:100%; display:block;" ><div id="9:4" style="width: 296px; position: absolute; left: 46px; height: 288px; top: 44px; color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans; text-align: left; font-style: normal; line-height: 190.40000915527344%; "><span key="end">Hello this is a longer text box</span></div><div id="9:5" style="transform: matrix(0.9466003775596619,-0.32240918278694153,0.3224092423915863,0.9466003775596619,0,0); transform-origin: 0% 0%; width: 133px; position: absolute; right: 87px; height: 134px; bottom: 11.11956787109375px; background-color: rgba(156, 189, 238, 1); "></div><div id="289:2" style="transform: matrix(0.9548656940460205,0.29703789949417114,-0.29703789949417114,0.9548656940460205,0,0); transform-origin: 0% 0%; width: 228px; position: absolute; left: 46.4188346862793px; height: 365px; top: 252px; background-image: url(./images/Data_Pane_Image); background-size: cover; "></div><div id="294:0" style="transform: matrix(0.948660135269165,-0.3162972033023834,0.3162972033023834,0.948660135269165,0,0); transform-origin: 0% 0%; width: 158.5342254638672px; position: absolute; left: 172px; height: 129.4781036376953px; top: 482.1439208984375px; background-image: url(./images/no_spaces); background-size: cover; "></div></section>',
    			'<section class="frame" style="overflow: hidden; background-color: rgba(203, 47, 47, 1);  width:100%; height:100%; display:block;" ><div id="175:1" style="transform: matrix(0.00878943782299757,-0.9999613761901855,0.9999613761901855,0.00878943782299757,0,0); transform-origin: 0% 0%; width: 228px; position: absolute; left: 96.00043487548828px; height: 140px; top: 360.4418640136719px; color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans; text-align: left; font-style: normal; line-height: 125%; "><span key="end">What’s up </span></div><div id="345:0" style="transform: matrix(0.9396926164627075,-0.3420201539993286,0.34202009439468384,0.9396926164627075,0,0); transform-origin: 0% 0%; width: 80px; position: absolute; right: 27px; height: 120px; bottom: -17.36163330078125px; background-color: rgba(206, 176, 176, 1); box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25); border-radius: 8px 0px 0px 0px; "></div><div id="292:0" style="width: 121px; position: absolute; left: 46px; height: 144px; top: 446px; overflow: hidden; background-color: rgba(187, 57, 57, 1); border: 4px solid rgba(0, 0, 0, 1); border-radius: 12px 12px 12px 12px; "><div id="297:0" style="transform: matrix(0.8857674598693848,-0.46412932872772217,0.46412932872772217,0.8857674598693848,0,0); transform-origin: 0% 0%; width: 53px; position: absolute; left: 30.584253311157227px; height: 45px; top: 52.869659423828125px; overflow: hidden; background-color: rgba(0, 68, 204, 1); "></div></div></section>',
    			'<section class="frame" style="overflow: hidden; background-color: rgba(233, 158, 158, 1);  width:100%; height:100%; display:block;" ><div id="175:5" style="width: 228px; position: absolute; left: 46px; height: 140px; top: 44px; color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans; text-align: left; font-style: normal; line-height: 125%; "><span key="end">And another</span></div></section>',
    			'<section class="frame" style="overflow: hidden; background-color: rgba(135, 48, 48, 1);  width:100%; height:100%; display:block;" ><div id="407:3" style="width: 228px; position: absolute; left: 46px; height: 210px; top: 44px; color: rgba(255, 255, 255, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans; text-align: left; font-style: normal; line-height: 125%; "><span key="11">And another</span><br key="br11" /><span key="end">ehehhe</span></div></section>',
    		],
    	},
    	{
    		name: 'Project 2',
    		stories: [
    			'<section class="frame" style="overflow: hidden; background-color: rgba(255, 255, 255, 1);  width:100%; height:100%; display:block;" ><div id="4:25" style="width: 126px; position: absolute; left: 85px; height: 126px; top: 222px; background-color: rgba(86, 204, 242, 1); border-radius: 50%; "></div></section>',
    			'<section class="frame" style="overflow: hidden; background-color: rgba(98, 170, 64, 1);  width:100%; height:100%; display:block;" ><div id="161:2" style="position: absolute; left: 54px; height: 70px; top: 264px; color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans; text-align: left; font-style: normal; line-height: 125%; "><span key="end">WHAT</span></div></section>',
    			'<section class="frame" style="overflow: hidden; background-color: rgba(199, 238, 180, 1);  width:100%; height:100%; display:block;" ><div id="161:4" style="position: absolute; left: 54px; height: 70px; top: 264px; color: rgba(0, 0, 0, 1); font-size: 54px; font-weight: 500; font-family: IBM Plex Sans; text-align: left; font-style: normal; line-height: 125%; "><span key="end">A new one</span></div></section>',
    		],
    	},
    	{
    		name: 'Page 4',
    		stories: [
    			'<section class="frame" style="overflow: hidden; background-color: rgba(143, 189, 208, 1); opacity: 0.949999988079071;  width:100%; height:100%; display:block;" ><div id="422:3" style="transform: matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,0,0); transform-origin: 0% 0%; width: 137px; position: absolute; left: calc(50% - 68.5px - -68.5px); height: 137px; top: calc(50% - 68.5px - 28.5px); background-color: rgba(233, 12, 12, 1); "></div></section>',
    		],
    	},
    	{
    		name: 'Project threee',
    		stories: [
    			'<section class="frame" style="overflow: hidden; background-color: rgba(192, 134, 227, 1);  width:100%; height:100%; display:block;" ><div id="163:2" style="width: 126px; position: absolute; left: 85px; height: 126px; top: 222px; background-color: rgba(86, 204, 242, 1); border-radius: 50%; "></div></section>',
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

    /* src/components/Content.svelte generated by Svelte v3.20.1 */

    function create_fragment$1(ctx) {
    	let html_tag;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(/*storyContent*/ ctx[0], null);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(target, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*storyContent*/ 1) html_tag.p(/*storyContent*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) html_tag.d();
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
    	let { storyContent = "<section>loading…</section>" } = $$props;
    	const writable_props = ["storyContent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Content", $$slots, []);

    	$$self.$set = $$props => {
    		if ("storyContent" in $$props) $$invalidate(0, storyContent = $$props.storyContent);
    	};

    	$$self.$capture_state = () => ({ storyContent });

    	$$self.$inject_state = $$props => {
    		if ("storyContent" in $$props) $$invalidate(0, storyContent = $$props.storyContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [storyContent];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { storyContent: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get storyContent() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set storyContent(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Story.svelte generated by Svelte v3.20.1 */
    const file = "src/components/Story.svelte";

    // (78:2) {#if showStoryContent}
    function create_if_block$1(ctx) {
    	let current;

    	const content = new Content({
    			props: { storyContent: /*storyContent*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(content.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const content_changes = {};
    			if (dirty & /*storyContent*/ 1) content_changes.storyContent = /*storyContent*/ ctx[0];
    			content.$set(content_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(78:2) {#if showStoryContent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let if_block = /*showStoryContent*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "story " + /*displayPosition*/ ctx[1] + " " + " svelte-jlz8u0");
    			add_location(div, file, 76, 0, 1566);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showStoryContent*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*displayPosition*/ 2 && div_class_value !== (div_class_value = "story " + /*displayPosition*/ ctx[1] + " " + " svelte-jlz8u0")) {
    				attr_dev(div, "class", div_class_value);
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
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
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
    		Content,
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

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
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
    			id: create_fragment$2.name
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

    // (88:4) {#each projectArray as project, i}
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
    				: "visible") + "\n        " + " svelte-rgg20e");

    			add_location(li, file$1, 88, 6, 1747);
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
    				: "visible") + "\n        " + " svelte-rgg20e")) {
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
    		source: "(88:4) {#each projectArray as project, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let nav;
    	let ol;
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

    			attr_dev(ol, "class", "svelte-rgg20e");
    			add_location(ol, file$1, 85, 2, 1696);
    			attr_dev(nav, "class", "svelte-rgg20e");
    			add_location(nav, file$1, 74, 0, 1504);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { projectIndex = 0 } = $$props; //prop so that you can pass which project from App
    	let { navOpen = false } = $$props;
    	const dispatch = createEventDispatcher();

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
    		init(this, options, instance$3, create_fragment$3, not_equal, { projectIndex: 0, navOpen: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$3.name
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

    var eventstart,eventend,eventmove,eventcancel;window.navigator.pointerEnabled?(eventstart="pointerdown",eventend="pointerup",eventmove="pointermove",eventcancel="pointercancel"):window.navigator.msPointerEnabled?(eventstart="MSPointerDown",eventend="MSPointerUp",eventmove="MSPointerMove",eventcancel="MSPointerCancel"):"ontouchstart"in window?(eventstart="touchstart",eventend="touchend",eventmove="touchmove",eventcancel="touchcancel"):(eventstart="mousedown",eventend="mouseup",eventmove="mousemove",eventcancel="mouseout");function trigger(a,b,c,d){if(!b)return void console.error("No event was provided. You do need to provide one.");if("string"==typeof a&&(a=document.querySelector(a)),document.createEvent){var e=document.createEvent("Events");e.initEvent(b,!0,!1),e.data=c,e.originalEvent=d,a.dispatchEvent(e);}}var gestures=function(){var g=Math.abs;function a(a){return "tagName"in a?a:a.parentNode}function b(a,b,c,d){return g(a-b)>=g(c-d)?0<a-b?"left":"right":0<c-d?"up":"down"}function c(a){if(n=null,k.last)try{k&&k.el&&(trigger(k.el,"longtap",null,a),k={});}catch(a){}}function d(){n&&clearTimeout(n),n=null;}function f(){h&&clearTimeout(h),j&&clearTimeout(j),i&&clearTimeout(i),n&&clearTimeout(n),h=j=i=n=null,k={};}var h,i,j,k={},l=150,m=20;/android/gim.test(navigator.userAgent)&&(l=200);var n;(function(){var o,p,q=document.body;q.addEventListener(eventstart,function(b){if(o=Date.now(),p=o-(k.last||o),"mousedown"===eventstart)k.el=a(b.target),"ripple"===b.target.nodeName&&(k.el=b.target.parentNode),h&&clearTimeout(h),k.x1=b.pageX,k.y1=b.pageY;else if(1===b.touches.length){if(!!b.target.disabled)return;k.el=a(b.touches[0].target),h&&clearTimeout(h),k.x1=b.touches[0].pageX,k.y1=b.touches[0].pageY;}0<p&&450>=p&&(k.isDoubleTap=!0),k.last=o,n=setTimeout(c,750,b);}),q.addEventListener(eventmove,function(a){if(d(),"mousemove"===eventmove)k.x2=a.pageX,k.y2=a.pageY;else if(1===a.touches.length)k.x2=a.touches[0].pageX,k.y2=a.touches[0].pageY,k.move=!0;else if(2===a.touches.length);}),q.addEventListener(eventend,function(a){d();!k.el||(k.x2&&g(k.x1-k.x2)>m||k.y2&&g(k.y1-k.y2)>m?i=setTimeout(function(){if(k&&k.el){var c=b(k.x1,k.x2,k.y1,k.y2);trigger(k.el,"swipe",c,a),trigger(k.el,"swipe"+c,null,a),k={};}},0):"last"in k&&(j=setTimeout(function(){k&&k.isDoubleTap?k&&k.el&&(trigger(k.el,"dbltap",null,a),a.preventDefault(),k={}):h=setTimeout(function(){h=null,k&&k.el&&!k.move?(trigger(k.el,"tap",null,a),k={}):f();},l);},0)));}),q.addEventListener("touchcancel",f);})();};//# sourceMappingURL=gestures.mjs.map

    /* src/components/Stories.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1, window: window_1 } = globals;
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

    // (421:8) {#if params.project == i}
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
    			attr_dev(div, "class", "svelte-1p2umk");
    			add_location(div, file$2, 422, 10, 11036);
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
    		source: "(421:8) {#if params.project == i}",
    		ctx
    	});

    	return block;
    }

    // (433:14) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "nextIndicators svelte-1p2umk");
    			add_location(div, file$2, 433, 16, 11431);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(433:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (427:42) 
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
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*held*/ ctx[3] || /*navOpen*/ ctx[5] ? "paused" : "no") + " svelte-1p2umk"));
    			add_location(div0, file$2, 428, 18, 11264);
    			attr_dev(div1, "id", "currentIndicator");
    			attr_dev(div1, "class", "svelte-1p2umk");
    			add_location(div1, file$2, 427, 16, 11218);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*held, navOpen*/ 40 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*held*/ ctx[3] || /*navOpen*/ ctx[5] ? "paused" : "no") + " svelte-1p2umk"))) {
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
    		source: "(427:42) ",
    		ctx
    	});

    	return block;
    }

    // (425:14) {#if params.story > p}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-1p2umk");
    			add_location(div, file$2, 425, 16, 11151);
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
    		source: "(425:14) {#if params.story > p}",
    		ctx
    	});

    	return block;
    }

    // (424:12) {#each stories as story, p}
    function create_each_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*params*/ ctx[0].story > /*p*/ ctx[38]) return create_if_block_1;
    		if (/*params*/ ctx[0].story == /*p*/ ctx[38]) return create_if_block_2;
    		return create_else_block$1;
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
    		source: "(424:12) {#each stories as story, p}",
    		ctx
    	});

    	return block;
    }

    // (440:8) {#each stories as story, j}
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
    		source: "(440:8) {#each stories as story, j}",
    		ctx
    	});

    	return block;
    }

    // (403:4) {#each projectArray as { name, stories }
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

    			attr_dev(div, "class", div_class_value = "project " + /*i*/ ctx[33] + "\n        " + (/*params*/ ctx[0].project == /*i*/ ctx[33]
    			? "currentProject"
    			: "") + "\n        " + (/*i*/ ctx[33] == /*nextProject*/ ctx[8]
    			? "nextProject"
    			: "") + "\n        " + (/*i*/ ctx[33] == /*prevProject*/ ctx[9]
    			? "prevProject"
    			: "") + "\n        " + " svelte-1p2umk");

    			attr_dev(div, "style", div_style_value = "\n        " + (/*held*/ ctx[3] && (/*i*/ ctx[33] == /*params*/ ctx[0].project || /*i*/ ctx[33] == /*nextProject*/ ctx[8] || /*i*/ ctx[33] == /*prevProject*/ ctx[9])
    			? "transform: translateX(" + (/*i*/ ctx[33] == /*prevProject*/ ctx[9]
    				? -100
    				: /*i*/ ctx[33] == /*nextProject*/ ctx[8] ? 100 : 0) + "%) rotateY(" + (Math.min(Math.max(/*gesture_gap*/ ctx[2] / 4.2, -90), 90) + (/*i*/ ctx[33] == /*nextProject*/ ctx[8] ? 90 : 0) + (/*i*/ ctx[33] == /*prevProject*/ ctx[9] ? -90 : 0)) + "deg) ;"
    			: "") + "\n        " + (/*params*/ ctx[0].project == /*i*/ ctx[33]
    			? "transform-origin: center " + /*swipeDirection*/ ctx[4] + ";"
    			: "") + "\n        " + (/*nextProject*/ ctx[8] == /*i*/ ctx[33]
    			? "transform-origin: center left;"
    			: "") + "\n        " + (/*prevProject*/ ctx[9] == /*i*/ ctx[33]
    			? "transform-origin: center right;"
    			: "") + "\n        " + (!/*held*/ ctx[3]
    			? "transition: left .5s ease, transform .5s ease;"
    			: "transition: left 0s, transform 0s") + "\n        ");

    			add_location(div, file$2, 405, 6, 9975);
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

    			if (!current || dirty[0] & /*params, nextProject, prevProject*/ 769 && div_class_value !== (div_class_value = "project " + /*i*/ ctx[33] + "\n        " + (/*params*/ ctx[0].project == /*i*/ ctx[33]
    			? "currentProject"
    			: "") + "\n        " + (/*i*/ ctx[33] == /*nextProject*/ ctx[8]
    			? "nextProject"
    			: "") + "\n        " + (/*i*/ ctx[33] == /*prevProject*/ ctx[9]
    			? "prevProject"
    			: "") + "\n        " + " svelte-1p2umk")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*held, params, nextProject, prevProject, gesture_gap, swipeDirection*/ 797 && div_style_value !== (div_style_value = "\n        " + (/*held*/ ctx[3] && (/*i*/ ctx[33] == /*params*/ ctx[0].project || /*i*/ ctx[33] == /*nextProject*/ ctx[8] || /*i*/ ctx[33] == /*prevProject*/ ctx[9])
    			? "transform: translateX(" + (/*i*/ ctx[33] == /*prevProject*/ ctx[9]
    				? -100
    				: /*i*/ ctx[33] == /*nextProject*/ ctx[8] ? 100 : 0) + "%) rotateY(" + (Math.min(Math.max(/*gesture_gap*/ ctx[2] / 4.2, -90), 90) + (/*i*/ ctx[33] == /*nextProject*/ ctx[8] ? 90 : 0) + (/*i*/ ctx[33] == /*prevProject*/ ctx[9] ? -90 : 0)) + "deg) ;"
    			: "") + "\n        " + (/*params*/ ctx[0].project == /*i*/ ctx[33]
    			? "transform-origin: center " + /*swipeDirection*/ ctx[4] + ";"
    			: "") + "\n        " + (/*nextProject*/ ctx[8] == /*i*/ ctx[33]
    			? "transform-origin: center left;"
    			: "") + "\n        " + (/*prevProject*/ ctx[9] == /*i*/ ctx[33]
    			? "transform-origin: center right;"
    			: "") + "\n        " + (!/*held*/ ctx[3]
    			? "transition: left .5s ease, transform .5s ease;"
    			: "transition: left 0s, transform 0s") + "\n        ")) {
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
    		source: "(403:4) {#each projectArray as { name, stories }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
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
    	nav.$on("project", handleNavProject);
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

    			attr_dev(main, "class", "svelte-1p2umk");
    			add_location(main, file$2, 398, 2, 9706);
    			set_style(div, "overflow", "hidden");
    			set_style(div, "height", "100vh");
    			set_style(div, "width", "100vw");
    			set_style(div, "display", "flex");
    			set_style(div, "align-items", "center");
    			set_style(div, "justify-content", "center");
    			set_style(div, "perspective", "1080px");
    			set_style(div, "cursor", "ew-resize");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*held*/ ctx[3] ? "grabbing" : "no") + " svelte-1p2umk"));
    			add_location(div, file$2, 378, 0, 9132);
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
    				listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[14], false, false, false),
    				listen_dev(div, "touchstart", /*touchstart_handler*/ ctx[24], { passive: true }, false, false),
    				listen_dev(div, "mousedown", prevent_default(/*mousedown_handler*/ ctx[25]), false, true, false),
    				listen_dev(div, "touchmove", /*touchmove_handler*/ ctx[26], { passive: true }, false, false),
    				listen_dev(div, "mousemove", prevent_default(/*mousemove_handler*/ ctx[27]), false, true, false),
    				listen_dev(div, "touchend", /*touchend_handler*/ ctx[28], { passive: true }, false, false),
    				listen_dev(div, "mouseup", prevent_default(/*mouseup_handler*/ ctx[29]), false, true, false)
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

    			if (!current || dirty[0] & /*held*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(/*held*/ ctx[3] ? "grabbing" : "no") + " svelte-1p2umk"))) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const swipeSensitivity = 100;
    const storyTimerTime = 6000;

    function handleNavProject(event) {
    	pushHandler(event.detail, 0);
    }

    function pushHandler(project, story) {
    	push("/" + project.toString() + "/" + story.toString());
    } // .then(() => { });

    function instance$4($$self, $$props, $$invalidate) {
    	gestures(); //figure this shit out at some point lol
    	let activeStories = [];

    	for (const project of projectArray) {
    		activeStories.push(0);
    	}

    	let { params = { project: 0, story: 0 } } = $$props;
    	let bufferProject = 0;
    	let gesture_start, gesture_active, gesture_gap = 0;
    	let held = false;
    	let swipeDirection, swipeBuffer = "right";
    	let timedout = true; //whether a gesture has timed out
    	let gestureTimer; //timer object to time that
    	let storyTimer; //timer object to time stories
    	let navOpen = false;

    	function showNav(event) {
    		$$invalidate(5, navOpen = event.detail.open);
    	}

    	const Timer = function (callback, delay) {
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
    	};

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
    		storyTimer.pause(); //pause story timer

    		$$invalidate(5, navOpen = false); //close nav
    		$$invalidate(3, held = true); //start holding gesture
    		timedout = false; //reset timedout, hasn't timed out yet

    		e.type == "touchstart"
    		? gesture_start = Math.round(e.changedTouches[0].pageX)
    		: gesture_start = e.pageX; //where the event starts

    		gesture_active = gesture_start;

    		gestureTimer = setTimeout(
    			() => {
    				timedout = true; //start gesture timer
    			},
    			300
    		);
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

    	async function gestureUp(e) {
    		if (!timedout) {
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

    		if (storyTimer) storyTimer.reset();
    		if (gestureTimer) clearTimeout(gestureTimer);
    		$$invalidate(3, held = false); //end holding gesture
    		gesture_start = 0;
    		gesture_active = 0;
    		$$invalidate(2, gesture_gap = 0);
    	}

    	function handleKeydown(event) {
    		if (event.keyCode == 39) {
    			handleProjects("next");
    		} else if (event.keyCode == 37) {
    			handleProjects("prev");
    		}
    	}

    	onMount(() => {
    		//when first mounts; basically on page load
    		storyTimer = new Timer(() => {
    				handleProjects("next");
    			},
    		storyTimerTime);
    	});

    	beforeUpdate(e => {
    		console.log("beforeupdate " + params.project + swipeDirection);
    	});

    	afterUpdate(() => {
    		console.log("afterupdate" + params.project + swipeDirection);
    	});

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Stories> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stories", $$slots, []);
    	const touchstart_handler = e => gestureDown(e);
    	const mousedown_handler = e => gestureDown(e);

    	const touchmove_handler = e => {
    		if (held) gestureMove(e);
    	};

    	const mousemove_handler = e => {
    		if (held) gestureMove(e);
    	};

    	const touchend_handler = e => {
    		if (held) gestureUp();
    	};

    	const mouseup_handler = e => {
    		if (held) gestureUp();
    	};

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		Story,
    		onMount,
    		afterUpdate,
    		beforeUpdate,
    		tick,
    		Nav,
    		projectArray,
    		getNext,
    		getPrev,
    		gestures,
    		push,
    		activeStories,
    		params,
    		bufferProject,
    		gesture_start,
    		gesture_active,
    		gesture_gap,
    		held,
    		swipeDirection,
    		swipeBuffer,
    		swipeSensitivity,
    		timedout,
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
    		if ("bufferProject" in $$props) $$invalidate(15, bufferProject = $$props.bufferProject);
    		if ("gesture_start" in $$props) gesture_start = $$props.gesture_start;
    		if ("gesture_active" in $$props) gesture_active = $$props.gesture_active;
    		if ("gesture_gap" in $$props) $$invalidate(2, gesture_gap = $$props.gesture_gap);
    		if ("held" in $$props) $$invalidate(3, held = $$props.held);
    		if ("swipeDirection" in $$props) $$invalidate(4, swipeDirection = $$props.swipeDirection);
    		if ("swipeBuffer" in $$props) swipeBuffer = $$props.swipeBuffer;
    		if ("timedout" in $$props) timedout = $$props.timedout;
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
    			//when params change, update activeStories
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

    		if ($$self.$$.dirty[0] & /*params, bufferProject*/ 32769) {
    			 if (parseInt(params.project) != bufferProject) {
    				if (parseInt(params.project) == 0) {
    					console.log("1111111111");

    					bufferProject == projectArray.length - 1
    					? $$invalidate(4, swipeDirection = "left")
    					: $$invalidate(4, swipeDirection = "right");
    				} else if (parseInt(params.project) == projectArray.length - 1) {
    					console.log("2222222222222");

    					bufferProject == 0
    					? $$invalidate(4, swipeDirection = "right")
    					: $$invalidate(4, swipeDirection = "left");
    				} else {
    					console.log("33333333333333");

    					parseInt(params.project) > bufferProject
    					? $$invalidate(4, swipeDirection = "left")
    					: $$invalidate(4, swipeDirection = "right");
    				}

    				console.log("hehehehe");
    				$$invalidate(15, bufferProject = parseInt(params.project));
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
    		gestureDown,
    		gestureMove,
    		gestureUp,
    		handleKeydown,
    		bufferProject,
    		gesture_start,
    		gesture_active,
    		timedout,
    		gestureTimer,
    		storyTimer,
    		swipeBuffer,
    		Timer,
    		handleProjects,
    		touchstart_handler,
    		mousedown_handler,
    		touchmove_handler,
    		mousemove_handler,
    		touchend_handler,
    		mouseup_handler
    	];
    }

    class Stories extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, not_equal, { params: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stories",
    			options,
    			id: create_fragment$4.name
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

    const { console: console_1$2 } = globals;

    function create_fragment$5(ctx) {
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function routeLoaded(event) {
    	console.log("routeLoaded");
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
    	}
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
