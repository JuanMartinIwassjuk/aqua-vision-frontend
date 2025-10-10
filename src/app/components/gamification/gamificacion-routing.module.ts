import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamificacionComponent } from './gamificacion.component';
import { TriviaComponent } from './trivia/trivia.component';
import { AquaSaveComponent } from './aquasave/aquasave.component';
import { MemoryGameComponent } from './memory-test/memory-test.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';


const routes: Routes = [
  { path: '', component: GamificacionComponent },
  { path: 'trivia', component: TriviaComponent },
  { path: 'aquasave', component: AquaSaveComponent },
  { path: 'memory-test', component: MemoryGameComponent },
  { path: 'drag-drop', component: DragDropComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GamificationRoutingModule {}