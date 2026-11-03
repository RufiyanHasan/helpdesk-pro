import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Tickets } from './tickets';

describe('Tickets', () => {
  let component: Tickets;
  let fixture: ComponentFixture<Tickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tickets],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Tickets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
