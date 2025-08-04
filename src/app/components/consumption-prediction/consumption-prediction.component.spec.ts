import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionPredictionComponent } from './consumption-prediction.component';

describe('ConsumptionPredictionComponent', () => {
  let component: ConsumptionPredictionComponent;
  let fixture: ComponentFixture<ConsumptionPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsumptionPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumptionPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
