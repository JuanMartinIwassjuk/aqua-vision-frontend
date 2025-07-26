import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteDiarioSectorComponent } from './reporte-diario-sector.component';

describe('ReporteDiarioSectorComponent', () => {
  let component: ReporteDiarioSectorComponent;
  let fixture: ComponentFixture<ReporteDiarioSectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteDiarioSectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteDiarioSectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
