import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { AITask } from '@/Models/AITasks';

interface AITaskModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  task: AITask;
}
const AITaskModal:React.FC<AITaskModalProps> = ({show, setShow, task}) => {
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task?.task} - {task?.time}</DialogTitle>
          <DialogDescription>
            Let's break this down into smaller steps.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {
            task?.actions.map((action, id) => (
              <div key={id}>
                <p>{action}</p>
              </div>
            ))
          }
        </div>
        <DialogFooter>
          <Button onClick={() => setShow(false)}
            >Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AITaskModal