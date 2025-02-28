
# Bulk import of transactions for ZHprivateTax

This Chrome extension modifies the page content of https://zhp.services.zh.ch/app/
to add buttons to the Wertschriftenverzeichnis page of a tax declaration.

This chrome extension is NOT affiliated with the canton of Zurich. **Usage is at own risk.**

## Installation

1. Clone this repository
2. Go to Extensions > "Manage extensions"
3. Click "Load unpacked"
4. Select the folder containing the repository

## Usage

The extension adds an import button to the Wertschriftenverzeichnis page of the tax declaration.
For tutorials on how to use it with a specific provider, see the [respective tutorial](./tutorials/)

## Supported brokers

- [IBKR](https://www.interactivebrokers.com/en/home.php) ([Tutorial](./tutorials/IBKR.md))
- [Morgan Stanley At Work](https://atwork.morganstanley.com/) ([Tutorial](./tutorials/Morgan%20Stanley%20At%20Work.md))

## Contributing

The code isn't written with production-level usage in mind (I wrote it for myself initially), so if you find bugs or ways to harden it, I'm happy to accept pull requests.

I am also happy to review code for other brokers / banks. The code has some minimal branching already, to facilitate support of multiple different sources (with the anticipation that CSV exports from other brokers would likely differ in format).

# Disclaimer

This project is not affiliated with the canton of Zurich, nor with any of the supported brokers or banks. Usage is at own risk.
