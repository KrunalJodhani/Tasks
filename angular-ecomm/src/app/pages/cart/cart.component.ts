import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { MatCardModule } from '@angular/material/card';
import { PrimaryButtonComponent } from '../../components/primary-button/primary-button.component';

@Component({
  selector: 'app-cart',
  imports: [MatCardModule, PrimaryButtonComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cartService = inject(CartService);
}
