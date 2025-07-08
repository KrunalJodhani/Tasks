/**
 * abstract class 
 * @method execute() - Executes the command logic. Must be implemented in subclass.
 * @method undo() - Reverts the command logic. Must be implemented in subclass.
 * @method getDescription() - Returns a string description of the command (optional override).
 */

export class Command {
    execute() {
        throw new Error('Must implement execute');
    }
    undo() {
        throw new Error('Must implement undo');
    }
    getDescription() {
        return 'Command';
    }
}
