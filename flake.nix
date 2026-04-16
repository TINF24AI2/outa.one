{
  description = "outa.one";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

      in
      {
        devShells.default =
          with pkgs;
          mkShell {
            buildInputs = [
              pkg-config
              nodejs_24
              pnpm
            ];
          };
      }
    );
}
