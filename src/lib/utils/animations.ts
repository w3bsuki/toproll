// GSAP Animation Utilities for Case Battles
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
gsap.registerPlugin(Flip, TextPlugin);

export interface AnimationConfig {
	duration?: number;
	delay?: number;
	ease?: string;
	stagger?: number;
}

export interface RevealAnimationConfig extends AnimationConfig {
	direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';
	distance?: number;
}

// Default animation settings
const DEFAULTS = {
	duration: 0.6,
	ease: 'power3.out',
	stagger: 0.1
};

// Battle-specific animations
export class BattleAnimations {
	private timeline: gsap.core.Timeline;

	constructor() {
		this.timeline = gsap.timeline();
	}

	// Item reveal animation with dramatic effect
	static revealItem(element: HTMLElement, config: RevealAnimationConfig = {}): gsap.core.Tween {
		const {
			duration = DEFAULTS.duration,
			delay = 0,
			ease = DEFAULTS.ease,
			direction = 'scale',
			distance = 50
		} = config;

		// Set initial state based on direction
		let fromVars: Record<string, any> = {};
		let toVars: Record<string, any> = {};

		switch (direction) {
			case 'up':
				fromVars = { y: distance, opacity: 0, scale: 0.8 };
				toVars = { y: 0, opacity: 1, scale: 1 };
				break;
			case 'down':
				fromVars = { y: -distance, opacity: 0, scale: 0.8 };
				toVars = { y: 0, opacity: 1, scale: 1 };
				break;
			case 'left':
				fromVars = { x: distance, opacity: 0, rotation: -15 };
				toVars = { x: 0, opacity: 1, rotation: 0 };
				break;
			case 'right':
				fromVars = { x: -distance, opacity: 0, rotation: 15 };
				toVars = { x: 0, opacity: 1, rotation: 0 };
				break;
			case 'scale':
				fromVars = { scale: 0, opacity: 0, rotation: 180 };
				toVars = { scale: 1, opacity: 1, rotation: 0 };
				break;
			case 'rotate':
				fromVars = { scale: 0.5, opacity: 0, rotation: -360 };
				toVars = { scale: 1, opacity: 1, rotation: 0 };
				break;
		}

		return gsap.fromTo(element, fromVars, {
			...toVars,
			duration,
			delay,
			ease,
			force3D: true
		});
	}

	// Staggered reveal for multiple items
	static revealItems(elements: HTMLElement[], config: RevealAnimationConfig = {}): gsap.core.Tween {
		const {
			duration = DEFAULTS.duration,
			stagger = DEFAULTS.stagger,
			ease = DEFAULTS.ease,
			...rest
		} = config;

		return gsap.fromTo(elements,
			{ scale: 0, opacity: 0, rotation: -15 },
			{
				scale: 1,
				opacity: 1,
				rotation: 0,
				duration,
				stagger,
				ease,
				force3D: true,
				...rest
			}
		);
	}

	// Celebrate winner animation
	static celebrateWinner(element: HTMLElement, config: AnimationConfig = {}): gsap.core.Tween {
		const { duration = 1, delay = 0 } = config;

		const timeline = gsap.timeline({ delay });

		// Bounce in effect
		timeline.fromTo(element,
			{ scale: 0, rotation: -180 },
			{ scale: 1.2, rotation: 0, duration: duration * 0.6, ease: 'back.out(1.7)' }
		);

		// Settle to normal size
		timeline.to(element, {
			scale: 1,
			duration: duration * 0.4,
			ease: 'power2.inOut'
		});

		// Pulse effect
		timeline.to(element, {
			scale: 1.05,
			duration: 0.2,
			repeat: 3,
			yoyo: true,
			ease: 'power2.inOut'
		});

		return timeline;
	}

	// Counting animation for numbers
        static countUp(element: HTMLElement, endValue: number, config: AnimationConfig = {}): gsap.core.Tween {
                const { duration = 1, delay = 0, ease = 'power2.out' } = config;

		const startValue = 0;
		const obj = { value: startValue };

		return gsap.to(obj, {
			value: endValue,
			duration,
			delay,
			ease,
			onUpdate: () => {
				element.textContent = this.formatCurrency(obj.value);
			}
		});
	}

	// Format currency for count animation
	private static formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	// Loading/Spinning animation
	static spin(element: HTMLElement, config: AnimationConfig = {}): gsap.core.Tween {
		const { duration = 1, repeat = -1 } = config;

                return gsap.to(element, {
                        rotation: 360,
                        duration,
                        repeat,
                        ease: 'none',
                        transformOrigin: 'center center'
                });
        }

        static slideInUp(element: HTMLElement, config: AnimationConfig = {}): gsap.core.Tween {
                const { duration = DEFAULTS.duration, delay = 0, ease = DEFAULTS.ease } = config;

                return gsap.fromTo(
                        element,
                        { y: 40, opacity: 0 },
                        {
                                y: 0,
                                opacity: 1,
                                duration,
                                delay,
                                ease
                        }
                );
        }

	// Glow/Pulse animation for rare items
	static glow(element: HTMLElement, config: AnimationConfig = {}): gsap.core.Tween {
		const { duration = 1.5, repeat = -1 } = config;

		return gsap.to(element, {
			boxShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)',
			duration,
			repeat,
			yoyo: true,
			ease: 'power2.inOut'
		});
	}

	// Shake animation for dramatic effects
	static shake(element: HTMLElement, config: AnimationConfig = {}): gsap.core.Tween {
		const { duration = 0.5 } = config;

		return gsap.fromTo(element,
			{ x: 0 },
			{
				x: [-10, 10, -8, 8, -5, 5, -2, 2, 0],
				duration,
				ease: 'power2.out'
			}
		);
	}

	// Battle progress animation
	static animateProgress(element: HTMLElement, progress: number, config: AnimationConfig = {}): gsap.core.Tween {
		const { duration = 1, delay = 0 } = config;

		return gsap.to(element, {
			width: `${progress}%`,
			duration,
			delay,
			ease: 'power2.out'
		});
	}

	// Floating animation for special elements
	static float(element: HTMLElement, config: AnimationConfig = {}): gsap.core.Tween {
		const { duration = 3, delay = 0 } = config;

		return gsap.to(element, {
			y: -10,
			duration,
			delay,
			repeat: -1,
			yoyo: true,
			ease: 'power1.inOut'
		});
	}

	// Sparkle effect for legendary items
	static sparkle(container: HTMLElement): void {
		const sparkles = 15;
		const colors = ['#fbbf24', '#f59e0b', '#d97706', '#92400e'];

		for (let i = 0; i < sparkles; i++) {
			const sparkle = document.createElement('div');
			sparkle.className = 'absolute pointer-events-none';
			sparkle.style.width = '4px';
			sparkle.style.height = '4px';
			sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
			sparkle.style.borderRadius = '50%';
			sparkle.style.left = `${Math.random() * 100}%`;
			sparkle.style.top = `${Math.random() * 100}%`;

			container.appendChild(sparkle);

			// Animate sparkle
			const timeline = gsap.timeline();
			timeline.fromTo(sparkle,
				{ scale: 0, opacity: 0 },
				{ scale: 1, opacity: 1, duration: 0.3, ease: 'back.out' }
			);
			timeline.to(sparkle, {
				y: -30,
				opacity: 0,
				duration: 1,
				ease: 'power2.out',
				onComplete: () => sparkle.remove()
			});

			// Stagger sparkle animations
			timeline.seek(Math.random() * 1.5);
		}
	}

	// Battle transition animations
	static transitionBattle(fromState: HTMLElement, toState: HTMLElement): gsap.core.Tween {
		const flip = Flip.getState(fromState);

		// Update DOM here if needed
		// ... (DOM manipulation would happen here)

		return Flip.from(flip, {
			duration: 0.8,
			ease: 'power2.inOut',
			stagger: 0.05,
			absolute: true
		});
	}

	// Chat message animation
	static slideInMessage(element: HTMLElement, direction: 'left' | 'right' = 'left'): gsap.core.Tween {
		const startX = direction === 'left' ? -50 : 50;

		return gsap.fromTo(element,
			{ x: startX, opacity: 0 },
			{ x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
		);
	}

	// Button press animation
	static buttonPress(element: HTMLElement): gsap.core.Tween {
		const timeline = gsap.timeline();

		timeline.to(element, {
			scale: 0.95,
			duration: 0.1,
			ease: 'power2.out'
		});

		timeline.to(element, {
			scale: 1,
			duration: 0.1,
			ease: 'back.out(1.7)'
		});

		return timeline;
	}

	// Card hover animation
	static cardHover(element: HTMLElement, isEntering: boolean): gsap.core.Tween {
		if (isEntering) {
			return gsap.to(element, {
				scale: 1.02,
				y: -4,
				duration: 0.3,
				ease: 'power2.out'
			});
		} else {
			return gsap.to(element, {
				scale: 1,
				y: 0,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	}
}

// Utility functions for common animation patterns
export const animations = {
	// Entrance animations
	fadeIn: (element: HTMLElement, config?: AnimationConfig) =>
		gsap.fromTo(element, { opacity: 0 }, { opacity: 1, ...DEFAULTS, ...config }),

	slideInUp: (element: HTMLElement, config?: AnimationConfig) =>
		gsap.fromTo(element, { y: 50, opacity: 0 }, { y: 0, opacity: 1, ...DEFAULTS, ...config }),

	slideInDown: (element: HTMLElement, config?: AnimationConfig) =>
		gsap.fromTo(element, { y: -50, opacity: 0 }, { y: 0, opacity: 1, ...DEFAULTS, ...config }),

	scaleIn: (element: HTMLElement, config?: AnimationConfig) =>
		gsap.fromTo(element, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, ...DEFAULTS, ...config }),

	// Exit animations
	fadeOut: (element: HTMLElement, config?: AnimationConfig) =>
		gsap.to(element, { opacity: 0, ...DEFAULTS, ...config }),

	slideOutUp: (element: HTMLElement, config?: AnimationConfig) =>
		gsap.to(element, { y: -50, opacity: 0, ...DEFAULTS, ...config }),

	slideOutDown: (element: HTMLElement, config?: AnimationConfig) =>
		gsap.to(element, { y: 50, opacity: 0, ...DEFAULTS, ...config }),

	scaleOut: (element: HTMLElement, config?: AnimationConfig) =>
		gsap.to(element, { scale: 0.8, opacity: 0, ...DEFAULTS, ...config })
};

// Export GSAP for direct usage if needed
export { gsap };

// Animation hooks for Svelte 5
export function createAnimation<T extends HTMLElement>(
	element: T,
	animationFn: (element: T) => gsap.core.Tween | gsap.core.Timeline
) {
	let animation: gsap.core.Tween | gsap.core.Timeline;

	$effect(() => {
		if (element) {
			animation = animationFn(element);
		}

		return () => {
			animation?.kill();
		};
	});
}

// Staggered animation hook
export function createStaggerAnimation<T extends HTMLElement>(
	elements: T[],
	animationFn: (elements: T[]) => gsap.core.Tween | gsap.core.Timeline
) {
	let animation: gsap.core.Tween | gsap.core.Timeline;

	$effect(() => {
		if (elements.length > 0) {
			animation = animationFn(elements);
		}

		return () => {
			animation?.kill();
		};
	});
}