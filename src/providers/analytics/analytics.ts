import { Injectable } from '@angular/core';
import { StoreApi } from '../../models/Api/Store';
import { CartItemViewModel, CartViewModel } from '../../models/ViewModels/CartViewModel';
import { ENV } from '@app/env';

declare global {
	interface Window {
		gtag: Function;
		dataLayer: Array<any>;
	}
}


@Injectable()
export class AnalyticsProvider {
	constructor() { }

	public async startTrackerWithId(id: string): Promise<void> {
		var script = document.createElement('script');
		script.async = true;
		script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
		document.body.appendChild(script);

		window.dataLayer = window.dataLayer || [];
		window.gtag = function () { window.dataLayer.push(arguments) };

		window.gtag('js', new Date());
		window.gtag('config', id, {
			custom_map: {
				dimension19: localStorage.getItem('ga:clientId')
			}
		});

		window.gtag((tracker) => {
			if (!localStorage.getItem('ga:clientId')) {
				localStorage.setItem('ga:clientId', tracker.get('clientId'));
			}
		});
	}

	public trackView(pagePath: string, pageTitle?: string, pageLocation?: string): void {
		window.gtag('config', ENV.GOOGLE_ANALYTICS_TRACKING_ID, {
			page_path: pagePath,
			page_title: pageTitle,
			page_location: pageLocation
		});
	}

	public trackEvent(category, action, label?, value?): void {
		window.gtag('event', action, {
			eventCategory: category,
			eventLabel: label,
			eventValue: value
		});
	}

	public trackPurchase(transactionΙd: string, totalPrice: number, store: StoreApi, cart: CartViewModel): void {
		window.gtag('event', 'purchase', {
			transaction_id: transactionΙd,
			affiliation: "mobile.serresdelivery.gr",
			value: totalPrice,
			currency: "EUR",
			items: cart.cartItems.concat(cart.cartItemOffers.reduce<CartItemViewModel[]>((a, b) => b.products.concat(a), [])).map(a => ({
				id: a.bid,
				name: a.name,
				brand: store.name,
				category: "Food",
				quantity: a.quantity,
				price: a.totalPrice
			}))
		});
	}
}
