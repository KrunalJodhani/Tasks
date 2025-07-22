import { Component, inject, signal } from '@angular/core';
import { Product } from '../../../models/products.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PrimaryButtonComponent } from '../../components/primary-button/primary-button.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  imports: [MatCardModule,MatButtonModule, PrimaryButtonComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {

  cartService = inject(CartService);

  async ngOnInit(){
    const res = await fetch('https://fakestoreapi.com/products');

    const data = await res.json();
    this.Products.update(current => [...current, ...data]);
  }

  Products = signal<Product[]>([
    {
      id: 101,
      title: 'Product 1',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI4Jo2IvPmeEYY4e0Bs75L-Rs_V9A8bXmMWA&s',
      price: 100,
      stock: 10
    },
    {
      id: 102,
      title: 'Product 2',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI4Jo2IvPmeEYY4e0Bs75L-Rs_V9A8bXmMWA&s',
      price: 200,
      stock: 5
    },
    {
      id: 103,
      title: 'Product 3',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI4Jo2IvPmeEYY4e0Bs75L-Rs_V9A8bXmMWA&s',
      price: 300,
      stock: 0
    },
    {
      id: 104,
      title: 'Product 4',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI4Jo2IvPmeEYY4e0Bs75L-Rs_V9A8bXmMWA&s',
      price: 400,
      stock: 2
    }
  ]);
}
