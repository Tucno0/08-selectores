import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, smallCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: smallCountry[] = [];
  public borders: smallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region : ['', Validators.required],
    country: ['', Validators.required],
    border : ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private conuntriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.conuntriesService.regions;
  }

  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('country')!.setValue('')),
        tap( () => this.borders = []),
        switchMap( region => this.conuntriesService.getCountriesByRegion(region)),
        // switchMap( this.conuntriesService.getCountriesByRegion), //Otra forma de hacer lo mismo que la linea anterior
      )
      .subscribe( countries => {
        this.countriesByRegion = countries.sort((a,b) => (a.name.common > b.name.common) ? 1 : ((b.name.common > a.name.common) ? -1 : 0)); // Ordena los paises por nombre

      });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('border')!.setValue('')),
        filter( (value: string) => value.length > 0),
        switchMap( (alphaCode) => this.conuntriesService.getCountryByAlphaCode(alphaCode)),
        switchMap( (country) => this.conuntriesService.getCountryBordersByCodes(country.borders))
      )
      .subscribe( countries => {
        this.borders = countries;
      });
  }
}
