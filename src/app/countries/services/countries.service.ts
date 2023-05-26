import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Region, smallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];

  constructor(
    private http: HttpClient, // Este servicio es el que nos permite hacer peticiones http, se importa el modulo HttpClientModule en el app.module.ts, porque es un modulo que se importa una sola vez en toda la aplicacion, y se inyecta en el constructor de este servicio, si se inyecta en el countries.module.ts no se podria usar en otros modulos.
  ) {}

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountriesByRegion(region: Region): Observable<smallCountry[]> {
    if ( !region ) return of([]);

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<smallCountry[]>(url)
      .pipe(
        map( countries => countries.map( country => ({
          name: country.name,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))), // El operador map transforma el observable en otro observable, en este caso transforma el observable de tipo any en un observable de tipo smallCountry[]
        tap( response => console.log({response}))
      )
  }

  getCountryByAlphaCode(alphaCode: string): Observable<smallCountry> {
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;

    return this.http.get<smallCountry>(url)
      .pipe(
        map( country => ({
            name: country.name,
            cca3: country.cca3,
            borders: country.borders ?? []
          })
      ));
  }

  getCountryBordersByCodes( borders: string[] ): Observable<smallCountry[]> {
    if( !borders || borders.length === 0 ) return of([]);

    const CountriesRequests: Observable<smallCountry>[] = [];

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode(code);
      CountriesRequests.push(request);
    });

    return combineLatest( CountriesRequests );
  }

}
