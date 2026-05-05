import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    currentUser = this.authService.currentUser;
    toasts = this.notificationService.toasts;

    // Security & Privacy
    isPrivacyMode = signal<boolean>(false);
    showTimeoutModal = signal<boolean>(false);
    timeoutCountdown = signal<number>(60);
    
    private inactivityTimer: any;
    private countdownInterval: any;
    private readonly INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

    // UI State
    isConfigPage = signal<boolean>(false);

    constructor() {
        this.router.events.subscribe(() => {
            const url = this.router.url;
            this.isConfigPage.set(
                url.includes('profile') || 
                url.includes('user-management') || 
                url.includes('config')
            );
        });
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        // Toggle Privacy Mode with Space key (only if not in an input)
        if (event.code === 'Space' && (event.target as HTMLElement).tagName !== 'INPUT' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
            event.preventDefault();
            this.togglePrivacy();
        }
        this.resetInactivityTimer();
    }

    @HostListener('window:mousemove')
    onMouseMove() {
        this.resetInactivityTimer();
    }

    ngOnInit() {
        this.resetInactivityTimer();
    }

    ngOnDestroy() {
        clearTimeout(this.inactivityTimer);
        clearInterval(this.countdownInterval);
    }

    togglePrivacy() {
        this.isPrivacyMode.update(v => !v);
        if (this.isPrivacyMode()) {
            this.notificationService.show('Mode confidentialité activé', 'info');
        }
    }

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        this.showTimeoutModal.set(false);
        clearInterval(this.countdownInterval);

        this.inactivityTimer = setTimeout(() => {
            this.startTimeoutCountdown();
        }, this.INACTIVITY_LIMIT);
    }

    startTimeoutCountdown() {
        this.showTimeoutModal.set(true);
        this.timeoutCountdown.set(60);
        this.countdownInterval = setInterval(() => {
            this.timeoutCountdown.update(v => v - 1);
            if (this.timeoutCountdown() <= 0) {
                this.logout();
            }
        }, 1000);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.showTimeoutModal.set(false);
        clearInterval(this.countdownInterval);
    }

    removeToast(id: number) {
        this.notificationService.remove(id);
    }

    // Navigation configuration
    get navItems() {
        const role = this.currentUser()?.role || 'AGENT';
        return role === 'ADMIN' ? this.navigation.admin : this.navigation.agent;
    }

    private navigation = {
        agent: [
            { path: '/scanner', label: 'Numérisation', icon: '📸' },
            { path: '/traitement-cheques', label: 'Traitement', icon: '⚖️' },
            { path: '/historique', label: 'Historique', icon: '⏱' }
        ],
        admin: [
            { path: '/admin-dashboard', label: 'Tableau de bord', icon: '⊞' },
            { path: '/user-management', label: 'Utilisateurs', icon: '👥' },
            { path: '/historique', label: 'Historique Global', icon: '⏱' },
            { path: '/config', label: 'Système', icon: '⚙' }
        ]
    };
}
