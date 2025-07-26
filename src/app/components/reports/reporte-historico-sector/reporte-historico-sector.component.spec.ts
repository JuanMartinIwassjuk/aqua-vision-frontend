import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHistoricoSectorComponent } from './reporte-historico-sector.component';

describe('ReporteHistoricoSectorComponent', () => {
  let component: ReporteHistoricoSectorComponent;
  let fixture: ComponentFixture<ReporteHistoricoSectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteHistoricoSectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteHistoricoSectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
