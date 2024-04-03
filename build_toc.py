import datetime
import pathlib
import lxml.html

docs = pathlib.Path(__file__).parent / 'docs'


for folder in docs.glob('*'):
    if not folder.is_dir():
        continue
    print(folder.name)

    with (folder / 'readme.md').open('w', encoding='utf-8') as writer:
        writer.write('| Name | Alias | Description |\n| --- | --- | --- |\n')
        for f in folder.glob('*.html'):
            print(f'\t{f}')
            html: lxml.html.HtmlElement = lxml.html.parse(f).getroot()

            name = f'[{f.stem}](./{f.name})'
            alias = html.find_class('ContentHeader')[0].getparent().text_content().split('\t')[-1]
            description = ''
            for h in html.findall('.//h3'):
                if h.text == 'Description':
                    pre = h.getnext().getnext()
                    if pre is not None:
                        description = pre.text_content()
                    break
            writer.write(f"| {name} | {alias} | {description} |\n")

        writer.write(f'\n`Last built {datetime.date.today()}`\n')
