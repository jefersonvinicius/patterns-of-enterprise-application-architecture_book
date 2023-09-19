import Handlebars from 'handlebars';

const MESSAGE_TYPES_FILES: Record<string, string | undefined> = {
  welcome: 'welcome.handlebars',
  confirm: 'confirm.handlebars',
};

export class Mailing {
  static NULL_PARAMETER = -1;
  static UNKNOWN_MESSAGE_TYPE = -2;
  static SUCCESS = 0;

  async send(messageType: string, args: Record<string, any>) {
    if (hasNullValue(args)) return Mailing.NULL_PARAMETER;
    const templateFilename = MESSAGE_TYPES_FILES[messageType];
    if (!templateFilename) return Mailing.UNKNOWN_MESSAGE_TYPE;
    const templatePath = `${import.meta.dir}/templates/${templateFilename}`;
    const templateFile = Bun.file(templatePath);
    const renderTemplate = Handlebars.compile(await templateFile.text());
    const email = renderTemplate(args);
    const file = Bun.file(`mailbox/${crypto.randomUUID()}.html`);
    await Bun.write(file, email);
    return Mailing.SUCCESS;
  }
}

function hasNullValue(object: any = {}) {
  for (const objectValue of Object.values(object)) {
    if (objectValue === null) return true;
    if (typeof objectValue === 'object') {
      return hasNullValue(objectValue);
    }
  }
  return false;
}
