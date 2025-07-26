import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHistoricoHogarComponent } from './reporte-historico-hogar.component';

describe('ReporteHistoricoHogarComponent', () => {
  let component: ReporteHistoricoHogarComponent;
  let fixture: ComponentFixture<ReporteHistoricoHogarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteHistoricoHogarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteHistoricoHogarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
