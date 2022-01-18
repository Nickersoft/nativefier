#!/usr/bin/env node
import 'source-map-support/register';
import yargs from 'yargs';
import { RawOptions } from '../shared/src/options/model';
export declare function initArgs(argv: string[]): yargs.Argv<RawOptions>;
export declare function parseArgs(args: yargs.Argv<RawOptions>): RawOptions;
