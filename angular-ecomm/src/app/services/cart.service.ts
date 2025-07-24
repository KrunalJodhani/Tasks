import { Injectable, signal } from '@angular/core';
import { Product } from '../../models/products.model';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private liveAnnouncer: LiveAnnouncer) { }

  cart = signal<Product[]>([]);

  addToCart(product: Product) {
    this.cart.set([...this.cart(), product]);
    this.liveAnnouncer.announce(`${product.title} added to cart`, 'assertive');
  }

  removeFromCart(id:number){
    this.liveAnnouncer.announce(`${this.cart().find(product => product.id === id)?.title} removed from cart`, 'assertive');
    this.cart.set(this.cart().filter(product => product.id !== id));
  }
}
