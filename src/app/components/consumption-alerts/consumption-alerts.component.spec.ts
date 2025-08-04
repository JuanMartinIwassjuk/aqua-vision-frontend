import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionAlertsComponent } from './consumption-alerts.component';

describe('ConsumptionAlertsComponent', () => {
  let component: ConsumptionAlertsComponent;
  let fixture: ComponentFixture<ConsumptionAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsumptionAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumptionAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
