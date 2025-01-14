/* istanbul ignore file */
import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import { findByCategory, getOrders, getProducts, getOrdersByPodName } from './api/api';
import { Order } from './shared/shareddtypes';
import './App.css';
import ProductList from './components/products/ProductList';
import { Footer } from './components/generalComponents/Footer';
import { Product } from './shared/shareddtypes'
import { ProductCart } from './shared/shareddtypes'
import NavBar from './components/generalComponents/NavBar';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Checkout from './shippment/CheckOut';
import Login from './components/login/Login';
import VistaPedidos from './components/pedidos/VistaPedidos';

function App(): JSX.Element {

  useEffect(() => {
    const carritoPersistente = localStorage.getItem("carrito");
    if (carritoPersistente) {
      let carrito: ProductCart[] = JSON.parse(carritoPersistente);
      setCarrito(carrito);
    }
    else
      localStorage.setItem("carrito", JSON.stringify([]));
  }, []);

  const [productos, setProductos] = useState<Product[]>([]);

  const refreshProductList = async () => {
    setProductos(await getProducts());
  }

  useEffect(() => {
    refreshProductList();
  }, []);

  const [productosRaquetas, setProductosRaquetas] = useState<Product[]>([]);

  const refreshProductRaquetsList = async () => {
    setProductosRaquetas(await findByCategory("Raquetas"));
  }

  useEffect(() => {
    refreshProductRaquetsList();
  }, []);

  const [productosPelotas, setProductosPelotas] = useState<Product[]>([]);

  const refreshProductBallsList = async () => {
    setProductosPelotas(await findByCategory("Pelotas"));
  }

  useEffect(() => {
    refreshProductBallsList();
  }, []);

  const [carrito, setCarrito] = useState([] as ProductCart[]);

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito))
  }, [carrito]);

  const addToCart = (clickedItem: Product) => {
    setCarrito(estadoActual => {
      const estaEnElCarrito = estadoActual.find(i => i.id === clickedItem.id);
      if (!estaEnElCarrito) {
        toast.success('Añadido');
        return [...estadoActual, { ...clickedItem, quantity: 1 }];
      }
      return [...estadoActual];
    });
  }

  const removeFromCart = (id: string) => {
    setCarrito(estadoActual => (
      estadoActual.reduce(
        (coleccion, p) => {
          if (p.id === id) {
            return coleccion;
          }
          return [...coleccion, p];
        }
        , [] as ProductCart[]
      )
    )
    )
  }

  const increaseFromCart = (clickedItem: ProductCart) => {
    setCarrito(estadoActual => {
      const estaEnElCarrito = estadoActual.find(i => i.id === clickedItem.id);
      if (estaEnElCarrito) {
        estadoActual.reduce(
          (coleccion, p) => {
            if (p.id === clickedItem.id) {
              p.quantity++;
              return [...coleccion, p];
            }
            return [...coleccion, p];
          }
          , [] as ProductCart[]
        );
      }
      return [...estadoActual];
    });
  }

  const reduceFromCart = (id: string) => {
    setCarrito(estadoActual => (
      estadoActual.reduce(
        (coleccion, p) => {
          if (p.id === id) {
            if (p.quantity > 1) {
              p.quantity--;
              return [...coleccion, p];
            }
            else
              return coleccion;
          }
          return [...coleccion, p];
        }
        , [] as ProductCart[]
      )
    )
    )
  }

  const getPrecio = () => {
    return carrito.reduce((acc: number, p) => acc + p.quantity * p.price, 0);
  }

  //const getElementosCarrito = () => { return carrito.length; }
  const precioCarrito = getPrecio();

  const [loggedAsAdmin, setLoggedAsAdmin] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrderList = async () => {
    const user = localStorage.getItem("userLogged");
    const admin = localStorage.getItem("loggedAsAdmin");

    if(admin)
      setOrders(await getOrders());
    else if(user){
      setOrders(await getOrdersByPodName(user));
    }
  }

  useEffect(() => {
    refreshOrderList();
  }, []);

  return (
    <>
      <Container>

        <NavBar props={carrito} remove={removeFromCart} precio={getPrecio} aumentar={increaseFromCart} reducir={reduceFromCart}></NavBar>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<ProductList props={productos} add={addToCart}></ProductList>} />
            <Route path="/raquets" element={<ProductList props={productosRaquetas} add={addToCart}></ProductList>} />
            <Route path="/balls" element={<ProductList props={productosPelotas} add={addToCart}></ProductList>} />
            <Route path="/login" element={<Login setPrecio={() => getPrecio()} setLoggedAdmin={setLoggedAsAdmin} adminLogged={loggedAsAdmin}></Login>} />
            {/* <Route path="/profile" element={<Profile props={productos[0]} add={addToCart}></Profile>} /> */}
            <Route path="/checkout" element={<Checkout carrito={carrito} precio={precioCarrito}></Checkout>} />
            <Route path="/orders" element={<VistaPedidos orders={orders}></VistaPedidos>} />
          </Routes>
        </Router>

        <Footer></Footer>
      </Container>
    </>
  );
}

export default App;
