import { Link } from "@remix-run/react";

export default function ServiceIndexPage() {
  return (
    <p>
      Sem serviço selecionado, escolha um a esquerda, ou{" "}
      <Link to="new" className="text-blue-500 underline">
        criar um novo serviço.
      </Link>
    </p>
  );
}
