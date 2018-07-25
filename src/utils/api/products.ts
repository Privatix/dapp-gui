import {fetch} from '../fetch';
import {AddAnswer} from '../../typings/SaveAnswer';
import {Product} from '../../typings/products';


export const addProduct = function (product:Product): Promise<AddAnswer> {
    return fetch('/products', {method:'post', body: product}) as Promise<AddAnswer>;
};

export const saveProduct  = function(product:Product): Promise<AddAnswer> {
    return fetch('/products', {method:'put', body: product}) as Promise<AddAnswer>;
};

export const getProducts = function(): Promise<Product[]>{
    return fetch('/products') as Promise<Product[]>;
};
