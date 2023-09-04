class TaskDto {
  constructor(task) {
    (this._id = task._id),
      (this.summary = task.summary),
      (this.descriptions = task.descriptions);
    this.due_date = task?.due_date;
    this.is_completed = task.is_completed;
  }
}

module.exports = TaskDto;
