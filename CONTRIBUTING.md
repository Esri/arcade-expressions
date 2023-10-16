# Contributing
Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**:

- [I want to contribute, what should I work on?](#i-want-to-contribute-what-should-i-work-on)
- [Before filling and issue](#before-filling-and-issue)
- [Getting a development environment set up](#getting-a-development-environment-set-up)
- [Adding a new expression](#adding-a-new-expression)
- [Commit message format](#commit-message-format)
- [Pull requests](#pull-requests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## I want to contribute, what should I work on?

You can help mostly by:

* **Suggesting ideas** for Arcade expressions by creating a [Expression request issue](https://github.com/Esri/arcade-expressions/issues/new?assignees=&labels=enhancement&projects=&template=new-expression.yml)<sup>1</sup>. 
* **Reporting problems** with existing expressions by creating a [Bug issue](https://github.com/Esri/arcade-expressions/issues/new?assignees=&labels=bug&projects=&template=bug.yml).
* **Working on the issues** marked as [help wanted](https://github.com/Esri/arcade-expressions/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22). There is also a [good first issue](https://github.com/Esri/arcade-expressions/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) label if you are just getting started.
  * Comment on the issue and check if any additional context is needed before you start working. This will also help everyone knows that you are already working on it.


> **(1)**: If you are looking for inspiration of example expressions, you can search in different places such as: ArcGIS Online ["Arcade Expressions and You"](https://www.arcgis.com/home/group.html?id=dfe07fe13d154b67bbd7a38a2be90fd9&view=list#content), [Arcade questions at Esri Community](https://community.esri.com/t5/forums/searchpage/tab/message?filter=includeForums,solvedThreads&q=arcade&noSynonym=false&solved=true&sort_by=-topicKudosCount&include_forums=true&collapse_discussion=true), [articles](https://www.esri.com/arcgis-blog/?s=#&tag=arcade), [videos](https://mediaspace.esri.com/esearch/search?keyword=arcade), or documentation pages (e.g. [Arcade samples within the ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/sample-code/?tagged=Arcade)). 

## Before filling and issue 



* If something isn't working the way you expect, **take a look at the [existing issues](https://github.com/Esri/arcade-expressions/issues) before logging a new one**. 
* If you have a **general question about Arcade**, please check the [arcade tag at Esri Community](https://community.esri.com/t5/tag/arcade/tg-p), or go to the [right place](https://github.com/Esri/arcade-expressions/issues/new/choose) where you can ask questions, and collaborate with others.
  * If you think Arcade should have its own community, you might want to consider [giving kudos to this idea](https://community.esri.com/t5/community-ideas/arcade-community/idi-p/1131578).
* Provide all of the requested info from the appropriate [issue template](https://github.com/Esri/arcade-expressions/issues/new/choose). 
* **Other things to consider when filling a bug issue**(so we can work on resolving the issue as soon as possible):
  - Use a clear and descriptive title.
  - Detail what is happening now vs what should happen.
  - Tell us how to reproduce the issue (e.g. is it happening in a specific profile, browser, ...?).
  - Can it be reliably reproduced? If not, tell us how often it happens and under what circumstances.
  - Provide a sample that reproduces the issue  whenever possible.
  - Screenshots, GIFsn and screen recordings are our friends!.
  - Did this problem start happening after a recent release or was it always a bug?.


## Getting a development environment set up

You can make use of the [ArcGIS Arcade Playground](https://developers.arcgis.com/arcade/playground/) if you need it, but to use this repository you don't need a special configuration, just run the expression in one of the [supported products](https://developers.arcgis.com/arcade/guide/products/#in-which-products-can-i-write-arcade-expressions).

## Adding a new expression

* Each expression lives in a markdown file. We have prepared a [template file](./arcade-expression-template.md) with all information it should include.
* Use [kebab-case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case) to name files and folders, and avoid special characters: `\/:*?"<>|.?`. 
* `README.md` files are the only exception.
* Include reference files in `images/` and `sample-data` within the same parent folder as the expression.
  * Use the same name as the markdown file. If several are needed, use the name as a prefix (e.g. `create-lateral-prototype.js` and `create-lateral-devsummit2023.js`).
  * Compress sample data files using ZIP and leave the original extension in the file name (e.g. `file-name.gdb.zip`, `file-name.stylx.zip`, ...).
* If you are grouping several expressions within a folder, include a `README.md` using [readme-template.md](./readme-template.md), and follow all conventions above.
  * Include a single link from the parent `README.md` to the new `README.md`.

## Commit message format

This project do not strictly follows [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), but we will use the format `<type>: description [optional #issue-number]`. Be sure to provide clear and sufficient information in commit messages.

For `<type>` you should use:

* **feat**: A new expression
* **fix**: A bug fix within an expression
* **docs**: Documentation only changes (changes in markdown)
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature

`description`:

* The subject contains succinct description of the change
* use the imperative, present tense: "change" not "changed" nor "changes"
* do not capitalize first letter
* do not place a period . at the end
* entire length of the subject must not go over 50 characters
* describe what the commit does, not what issue it relates to or fixes
* **be brief, yet descriptive** - we should have a good understanding of what the commit does by reading the subject

Examples: 
* `fix: adds some calculation attribute rules related to work migrating attributes #11` 
* `doc: adds missing expressions to README files #77`

## Pull requests 

Before each PR follow remember:

* Updating the list of expressions in the `README.md` within the same folder.
* Link your PR to an issue if it exists. Use a supported keyword in the pull request description. Ex."**Closes #10**" or "**Fixes Esri/arcade-expressions#10**" ([more](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)).
