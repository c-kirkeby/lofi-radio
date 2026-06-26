
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const SESSION_MANAGER: string;
	export const GHOSTTY_BIN_DIR: string;
	export const COLORTERM: string;
	export const XDG_CONFIG_DIRS: string;
	export const XDG_SESSION_PATH: string;
	export const HISTCONTROL: string;
	export const XDG_MENU_PREFIX: string;
	export const TERM_PROGRAM_VERSION: string;
	export const DESKTOPINTEGRATION: string;
	export const FNM_ARCH: string;
	export const NVIM: string;
	export const URUNTIME: string;
	export const TMUX: string;
	export const HOSTNAME: string;
	export const HISTSIZE: string;
	export const ICEAUTHORITY: string;
	export const CLAUDE_TOPIC: string;
	export const GUESTFISH_OUTPUT: string;
	export const XDG_DATA_HOME: string;
	export const XDG_CONFIG_HOME: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const TMUX_PLUGIN_MANAGER_PATH: string;
	export const FNM_NODE_DIST_MIRROR: string;
	export const LIBBDPLUS_PATH: string;
	export const NVIM_LOG_FILE: string;
	export const DESKTOP_SESSION: string;
	export const DISTROBOX_ENTER_PATH: string;
	export const GTK_RC_FILES: string;
	export const GPG_TTY: string;
	export const EDITOR: string;
	export const MASON: string;
	export const PWD: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XDG_SESSION_TYPE: string;
	export const ARG0: string;
	export const PNPM_HOME: string;
	export const SYSTEMD_EXEC_PID: string;
	export const XAUTHORITY: string;
	export const SDL_VIDEO_MINIMIZE_ON_FOCUS_LOSS: string;
	export const GUESTFISH_RESTORE: string;
	export const container: string;
	export const XKB_DEFAULT_MODEL: string;
	export const GTK2_RC_FILES: string;
	export const GHOSTTY_SHELL_FEATURES: string;
	export const HOME: string;
	export const SHARUN_DIR: string;
	export const SSH_ASKPASS: string;
	export const LANG: string;
	export const FNM_COREPACK_ENABLED: string;
	export const LS_COLORS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const GH_TELEMETRY: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const STARSHIP_SHELL: string;
	export const VIMRUNTIME: string;
	export const WAYLAND_DISPLAY: string;
	export const GUESTFISH_PS1: string;
	export const MANAGERPID: string;
	export const GIO_LAUNCH_DESKTOP: string;
	export const APPIMAGE_ARCH: string;
	export const STARSHIP_SESSION_KEY: string;
	export const CONTAINER_ID: string;
	export const STEAM_FRAME_FORCE_CLOSE: string;
	export const APPDIR: string;
	export const KDE_SESSION_UID: string;
	export const XDG_CACHE_HOME: string;
	export const INFOPATH: string;
	export const XKB_DEFAULT_LAYOUT: string;
	export const GHOSTTY_RESOURCES_DIR: string;
	export const XDG_SESSION_CLASS: string;
	export const TERMINFO: string;
	export const TERM: string;
	export const LIBTHAI_DICTDIR: string;
	export const LESSOPEN: string;
	export const USER: string;
	export const TMUX_PANE: string;
	export const AMDGPU_ASIC_ID_TABLE_PATHS: string;
	export const OWD: string;
	export const QT_WAYLAND_RECONNECT: string;
	export const KDE_SESSION_VERSION: string;
	export const PAM_KWALLET5_LOGIN: string;
	export const DO_NOT_TRACK: string;
	export const SUDO_ASKPASS: string;
	export const DISPLAY: string;
	export const SHLVL: string;
	export const APPOFFSET: string;
	export const LIBAACS_PATH: string;
	export const GUESTFISH_INIT: string;
	export const FNM_VERSION_FILE_STRATEGY: string;
	export const XDG_SESSION_ID: string;
	export const MANAGERPIDFDID: string;
	export const TERMINFO_DIRS: string;
	export const XDG_STATE_HOME: string;
	export const APPIMAGE: string;
	export const XDG_RUNTIME_DIR: string;
	export const FNM_RESOLVE_ENGINES: string;
	export const MYVIMRC: string;
	export const GSETTINGS_BACKEND: string;
	export const NODE_PATH: string;
	export const DEBUGINFOD_URLS: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const KDEDIRS: string;
	export const XDG_DATA_DIRS: string;
	export const KDE_FULL_SESSION: string;
	export const URUNTIME_DIR: string;
	export const PATH: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const KDE_APPLICATIONS_AS_SCOPE: string;
	export const MAIL: string;
	export const FNM_DIR: string;
	export const FNM_MULTISHELL_PATH: string;
	export const UID: string;
	export const BREW_BASH_COMPLETION: string;
	export const FNM_LOGLEVEL: string;
	export const TERM_PROGRAM: string;
	export const VP_TOOL_RECURSION: string;
	export const VP_VERSION: string;
	export const VP_COMMAND: string;
	export const OXLINT_TSGOLINT_PATH: string;
	export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		SESSION_MANAGER: string;
		GHOSTTY_BIN_DIR: string;
		COLORTERM: string;
		XDG_CONFIG_DIRS: string;
		XDG_SESSION_PATH: string;
		HISTCONTROL: string;
		XDG_MENU_PREFIX: string;
		TERM_PROGRAM_VERSION: string;
		DESKTOPINTEGRATION: string;
		FNM_ARCH: string;
		NVIM: string;
		URUNTIME: string;
		TMUX: string;
		HOSTNAME: string;
		HISTSIZE: string;
		ICEAUTHORITY: string;
		CLAUDE_TOPIC: string;
		GUESTFISH_OUTPUT: string;
		XDG_DATA_HOME: string;
		XDG_CONFIG_HOME: string;
		MEMORY_PRESSURE_WRITE: string;
		TMUX_PLUGIN_MANAGER_PATH: string;
		FNM_NODE_DIST_MIRROR: string;
		LIBBDPLUS_PATH: string;
		NVIM_LOG_FILE: string;
		DESKTOP_SESSION: string;
		DISTROBOX_ENTER_PATH: string;
		GTK_RC_FILES: string;
		GPG_TTY: string;
		EDITOR: string;
		MASON: string;
		PWD: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		XDG_SESSION_TYPE: string;
		ARG0: string;
		PNPM_HOME: string;
		SYSTEMD_EXEC_PID: string;
		XAUTHORITY: string;
		SDL_VIDEO_MINIMIZE_ON_FOCUS_LOSS: string;
		GUESTFISH_RESTORE: string;
		container: string;
		XKB_DEFAULT_MODEL: string;
		GTK2_RC_FILES: string;
		GHOSTTY_SHELL_FEATURES: string;
		HOME: string;
		SHARUN_DIR: string;
		SSH_ASKPASS: string;
		LANG: string;
		FNM_COREPACK_ENABLED: string;
		LS_COLORS: string;
		XDG_CURRENT_DESKTOP: string;
		GH_TELEMETRY: string;
		MEMORY_PRESSURE_WATCH: string;
		STARSHIP_SHELL: string;
		VIMRUNTIME: string;
		WAYLAND_DISPLAY: string;
		GUESTFISH_PS1: string;
		MANAGERPID: string;
		GIO_LAUNCH_DESKTOP: string;
		APPIMAGE_ARCH: string;
		STARSHIP_SESSION_KEY: string;
		CONTAINER_ID: string;
		STEAM_FRAME_FORCE_CLOSE: string;
		APPDIR: string;
		KDE_SESSION_UID: string;
		XDG_CACHE_HOME: string;
		INFOPATH: string;
		XKB_DEFAULT_LAYOUT: string;
		GHOSTTY_RESOURCES_DIR: string;
		XDG_SESSION_CLASS: string;
		TERMINFO: string;
		TERM: string;
		LIBTHAI_DICTDIR: string;
		LESSOPEN: string;
		USER: string;
		TMUX_PANE: string;
		AMDGPU_ASIC_ID_TABLE_PATHS: string;
		OWD: string;
		QT_WAYLAND_RECONNECT: string;
		KDE_SESSION_VERSION: string;
		PAM_KWALLET5_LOGIN: string;
		DO_NOT_TRACK: string;
		SUDO_ASKPASS: string;
		DISPLAY: string;
		SHLVL: string;
		APPOFFSET: string;
		LIBAACS_PATH: string;
		GUESTFISH_INIT: string;
		FNM_VERSION_FILE_STRATEGY: string;
		XDG_SESSION_ID: string;
		MANAGERPIDFDID: string;
		TERMINFO_DIRS: string;
		XDG_STATE_HOME: string;
		APPIMAGE: string;
		XDG_RUNTIME_DIR: string;
		FNM_RESOLVE_ENGINES: string;
		MYVIMRC: string;
		GSETTINGS_BACKEND: string;
		NODE_PATH: string;
		DEBUGINFOD_URLS: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		KDEDIRS: string;
		XDG_DATA_DIRS: string;
		KDE_FULL_SESSION: string;
		URUNTIME_DIR: string;
		PATH: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		KDE_APPLICATIONS_AS_SCOPE: string;
		MAIL: string;
		FNM_DIR: string;
		FNM_MULTISHELL_PATH: string;
		UID: string;
		BREW_BASH_COMPLETION: string;
		FNM_LOGLEVEL: string;
		TERM_PROGRAM: string;
		VP_TOOL_RECURSION: string;
		VP_VERSION: string;
		VP_COMMAND: string;
		OXLINT_TSGOLINT_PATH: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
