import { Game, PlayerSendsCommand } from "@gathertown/gather-game-client";
import { ServerClientEventContext } from "@gathertown/gather-game-client/dist/src/GameEventContexts";

interface CommandList {
  [command: string]: {
    description: string;
    helptext?: string;
    public: boolean;
    example?: string;
    fx: Function;
  };
}

interface CommandProps {
  game: Game;
  parser: string[];
  context: ServerClientEventContext;
  playerSendsCommand: PlayerSendsCommand;
}

export function checkForCommand({
  game,
  parser,
  playerSendsCommand,
  context
}: CommandProps) {
  if (Object.keys(commandList).includes(parser[0])) {
    commandList[parser[0]].fx({
      game,
      parser,
      playerSendsCommand,
      context
    });
  }
}

export const commandList: CommandList = {
  commands: {
    description:
      "Chats to the user all the public commands registered by this extension.",
    public: true,
    fx: async ({ game, context }: CommandProps) => {
      Object.keys(commandList).forEach((key) => {
        if (commandList[key].public) {
          game.chat(context.playerId!, [], context.player!.map!, {
            contents: `Command: /${key}\nDescription: ${commandList[key].description}\n`
          });
        }
      });
    }
  },

  help: {
    description: "Chats to the user detailed instructions about a command.",
    public: true,
    helptext: "Enter /help [command] to get details about /[command].",
    example: "'/help commands'",
    fx: async ({ game, context, parser }: CommandProps) => {
      if (parser.length > 1 && commandList[parser[1]].public) {
        game.chat(context.playerId!, [], context.player!.map!, {
          contents:
            `Command: /${parser[1]}` +
            `\nInstructions:\n${
              commandList[parser[1]].helptext ??
              commandList[parser[1]].description
            }` +
            (commandList[parser[1]].example
              ? `\nExample:\n${commandList[parser[1]].example}`
              : ``) +
            `\n--------`
        });
      } else if (parser.length === 1) {
        game.chat(context.playerId!, [], context.player!.map!, {
          contents:
            `Command: /${"help"}` +
            `\nInstructions:\n${commandList["help"].helptext}` +
            `\nExample:\n${commandList["help"].example}` +
            `\n--------`
        });
      } else {
        game.chat(context.playerId!, [], context.player!.map!, {
          contents: `Sorry, no such command found.\n--------`
        });
      }
    }
  }

  /*
  "command": {
    description: "Short description of what the command does",
    helptext: "Longer description of what the function does. Explain parameters here using [variables].",
    example: "'/command example'" //Example of the command being used. Note the '' around the command, to prevent recursive use.
    public: true or false, //Determines if command is shown when /command is run.
    fx: {({game, parser, context, playerSendsCommand}: CommandProps) => {}} //This is the function that is run when the command is used. Can be async if needed.
  }
  */
};
