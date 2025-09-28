<script lang="ts">
	import { Search, Bell, Settings, User, Crown, Gift, Menu, X, ChevronDown } from 'lucide-svelte';
	import AuthButton from '$lib/components/AuthButton.svelte';

	interface NavbarProps {
		isAuthenticated?: boolean;
		user?: {
			id: string;
			steamId: string;
			username: string;
			avatar?: string;
			balance: number;
			totalWagered: number;
			totalProfit: number;
			winRate: number;
			biggestWin: number;
			caseBattleWins: number;
		} | null;
		class?: string;
	}

	let { isAuthenticated = false, user, class: className = '' }: NavbarProps = $props();

	// Mobile menu state
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		// Add haptic feedback
		if ('vibrate' in navigator) {
			navigator.vibrate(10);
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	// Calculate user level for display
	const userLevel = $derived(Math.floor((user?.totalWagered || 0) / 1000) + 1);
</script>

<!-- Enhanced Gaming Navbar with Mobile Support -->
<div class="navbar min-h-[64px] border-b-2 border-base-300 bg-base-100 px-4 {className}">
	<!-- Mobile: Start Section (Logo + Hamburger) -->
	<div class="navbar-start flex w-full items-center justify-between lg:w-1/3">
		<!-- Logo with Gaming Accent -->
		<a href="/" class="group flex items-center gap-3">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent"
			>
				<span class="text-lg font-bold text-base-content">T</span>
			</div>
			<h1
				class="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent transition-transform group-hover:scale-105"
			>
				TopRoll
			</h1>
		</a>

		<!-- Mobile Menu Button -->
		<button
			class="btn btn-square btn-ghost lg:hidden"
			onclick={toggleMobileMenu}
			aria-label="Toggle menu"
		>
			{#if mobileMenuOpen}
				<X class="h-6 w-6" />
			{:else}
				<Menu class="h-6 w-6" />
			{/if}
		</button>
	</div>

	<!-- Desktop: Center Section (Search + Quick Actions) -->
	<div class="navbar-center hidden lg:flex lg:w-1/3">
		<!-- Search Bar -->
		<div class="form-control w-full max-w-sm">
			<div class="join">
				<input
					type="text"
					placeholder="Search games, cases..."
					class="input-bordered input join-item w-full focus:border-primary"
				/>
				<button class="btn join-item btn-primary">
					<Search class="h-4 w-4" />
				</button>
			</div>
		</div>
	</div>

	<!-- Desktop: End Section (Auth + User Menu) -->
	<div class="navbar-end hidden lg:flex lg:w-1/3 lg:justify-end">
		{#if !isAuthenticated}
			<!-- Desktop Auth Button -->
			<form method="POST" action="/api/auth/steam/login">
				<button type="submit" class="btn gap-2 btn-primary">
					<span class="font-semibold">Sign in with Steam</span>
				</button>
			</form>
		{:else}
			<!-- Desktop User Menu -->
			<div class="flex items-center gap-4">
				<!-- Quick Actions -->
				<div class="flex items-center gap-2">
					<button class="btn gap-2 btn-outline btn-sm">
						<Crown class="h-4 w-4" />
						<span class="hidden xl:inline">VIP</span>
					</button>
					<button class="btn gap-2 btn-sm btn-success">
						<Gift class="h-4 w-4" />
						<span class="hidden xl:inline">DEPOSIT</span>
					</button>
				</div>

				<!-- Balance Display -->
				<div class="stats stats-horizontal shadow-sm">
					<div class="stat px-4 py-2">
						<div class="stat-value text-lg text-primary">${user?.balance?.toLocaleString()}</div>
						<div class="stat-title text-xs">Balance</div>
					</div>
				</div>

				<!-- Notifications -->
				<div class="indicator">
					<span class="indicator-item badge badge-xs badge-error"></span>
					<button class="btn btn-circle btn-ghost">
						<Bell class="h-5 w-5" />
					</button>
				</div>

				<!-- User Profile Dropdown -->
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn gap-2 pl-2 btn-ghost">
						{#if user?.avatar}
							<div class="avatar">
								<div class="w-8 rounded-full ring ring-primary ring-offset-2">
									<img src={user.avatar} alt={user.username} />
								</div>
							</div>
						{:else}
							<div class="placeholder avatar">
								<div class="w-8 rounded-full bg-base-300 text-base-content">
									<User class="h-4 w-4" />
								</div>
							</div>
						{/if}
						<div class="hidden text-left xl:block">
							<div class="text-sm font-semibold">{user?.username}</div>
							<div class="text-xs text-base-content/60">Level {userLevel}</div>
						</div>
						<ChevronDown class="h-4 w-4" />
					</div>
					<ul class="dropdown-content menu z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
						<li><a href="/profile">Profile</a></li>
						<li><a href="/inventory">Inventory</a></li>
						<li><a>Settings</a></li>
						<li><hr /></li>
						<li><a>Sign Out</a></li>
					</ul>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Mobile Menu Drawer -->
{#if mobileMenuOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
		onclick={closeMobileMenu}
		role="presentation"
	></div>

	<!-- Mobile Menu Content -->
	<div class="fixed inset-y-0 left-0 z-50 w-80 bg-base-100 shadow-xl lg:hidden">
		<div class="menu min-h-full w-full p-4">
			<!-- Mobile Search -->
			<div class="form-control mb-6">
				<div class="join">
					<input
						type="text"
						placeholder="Search..."
						class="input-bordered input join-item flex-1"
					/>
					<button class="btn join-item btn-primary">
						<Search class="h-4 w-4" />
					</button>
				</div>
			</div>

			{#if isAuthenticated && user}
				<!-- Mobile User Info -->
				<div class="card mb-6 bg-gradient-to-br from-primary/10 to-accent/10 shadow-sm">
					<div class="card-body p-4">
						<div class="flex items-center gap-3">
							{#if user.avatar}
								<div class="avatar">
									<div class="w-12 rounded-full ring ring-primary ring-offset-2">
										<img src={user.avatar} alt={user.username} />
									</div>
								</div>
							{:else}
								<div class="placeholder avatar">
									<div class="w-12 rounded-full bg-base-300 text-base-content">
										<User class="h-6 w-6" />
									</div>
								</div>
							{/if}
							<div>
								<h3 class="font-bold">{user.username}</h3>
								<p class="text-sm text-base-content/60">Level {userLevel}</p>
							</div>
						</div>
						<div class="divider my-2"></div>
						<div class="stats">
							<div class="stat place-items-center py-2">
								<div class="stat-value text-lg text-primary">${user.balance.toLocaleString()}</div>
								<div class="stat-title text-xs">Balance</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Mobile Quick Actions -->
				<div class="mb-6 grid grid-cols-2 gap-2">
					<button class="btn justify-start gap-2 btn-outline">
						<Crown class="h-4 w-4" />
						VIP Club
					</button>
					<button class="btn justify-start gap-2 btn-success">
						<Gift class="h-4 w-4" />
						Deposit
					</button>
				</div>
			{/if}

			<!-- Mobile Navigation Links -->
			<ul class="space-y-2">
				<li>
					<a href="/" class="btn w-full justify-start btn-ghost" onclick={closeMobileMenu}>Home</a>
				</li>
				<li>
					<a href="/cases" class="btn w-full justify-start btn-ghost" onclick={closeMobileMenu}
						>Cases</a
					>
				</li>
				<li>
					<a href="/inventory" class="btn w-full justify-start btn-ghost" onclick={closeMobileMenu}
						>Inventory</a
					>
				</li>
				{#if isAuthenticated}
					<li>
						<a href="/profile" class="btn w-full justify-start btn-ghost" onclick={closeMobileMenu}
							>Profile</a
						>
					</li>
					<li><hr /></li>
					<li><a class="btn w-full justify-start btn-ghost">Settings</a></li>
					<li><a class="btn w-full justify-start btn-ghost">Sign Out</a></li>
				{:else}
					<li><hr /></li>
					<li>
						<form method="POST" action="/api/auth/steam/login" class="w-full">
							<button type="submit" class="btn w-full btn-primary"> Sign in with Steam </button>
						</form>
					</li>
				{/if}
			</ul>
		</div>
	</div>
{/if}

<style>
	/* Mobile menu animations */
	.drawer-side {
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Show mobile menu */
	:global(.mobile-menu-open) .drawer-side {
		transform: translateX(0);
	}

	/* Gaming theme enhancements */
	.navbar {
		box-shadow: 0 1px 0 0 rgb(from var(--color-primary) r g b / 0.1);
	}

	/* Responsive adjustments */
	@media (max-width: 1024px) {
		.navbar-center,
		.navbar-end {
			display: none !important;
		}
	}

	/* Touch improvements */
	@media (hover: none) and (pointer: coarse) {
		.btn:active {
			transform: scale(0.95);
		}
	}
</style>
