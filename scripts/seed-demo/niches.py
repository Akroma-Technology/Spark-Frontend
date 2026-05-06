"""
Client configurations per niche — simulates 8 real clients of Akroma Spark.

Each client has brand context, visual DNA and search description that feed into
the same prompt pipeline the backend uses (ContentPlanner → VisualPlan →
ImageCreative → ImageGen).

Handles and display names shown in the Instagram mockup are fixed here so the
demo feels like a real account rather than a stock template.
"""

NICHE_CLIENTS = {
    "fitness": {
        "handle": "gympower.oficial",
        "display_name": "GymPower Academia",
        "brand_context": (
            "Academia GymPower, rede com 3 unidades em Sao Paulo. Publico 25-45 anos. "
            "Tom motivacional e direto, foco em resultado real, nao estetica vazia. "
            "Diferencial: treinos com acompanhamento nutricional incluso. "
            "Valores: disciplina, progresso mensuravel, comunidade."
        ),
        "image_style": (
            "Fotografia editorial moderna de academia, tons escuros dramaticos com "
            "acento amarelo/ambar energetico. Tipografia bold condensed tipo Nike/Gymshark. "
            "Sempre com peso visual, nunca flat."
        ),
        "search_description": (
            "tendencias de treino de forca, recuperacao muscular, nutricao esportiva "
            "e protocolos de performance para academias em 2026"
        ),
        "fixed_hashtags": "#gympower #academiasp #treinodeforca",
    },
    "tecnologia": {
        "handle": "devpro.br",
        "display_name": "DevPro Brasil",
        "brand_context": (
            "DevPro, plataforma de cursos e consultoria para desenvolvedores senior. "
            "Publico 22-40 anos, devs full-stack, tech leads, CTOs. "
            "Tom provocativo, opinativo, com autoridade tecnica. "
            "Diferencial: conteudo pratico com cases reais, nao teoria generica."
        ),
        "image_style": (
            "Estetica cyber-editorial, fundos escuros com syntax highlighting, "
            "tipografia monospace, acentos em cyan/verde neon. Referencia: "
            "Linear, Anthropic design system."
        ),
        "search_description": (
            "tendencias recentes de inteligencia artificial, LLMs, engenharia de software, "
            "cloud e carreira em tecnologia em 2026"
        ),
        "fixed_hashtags": "#devpro #tecnologia #programacao",
    },
    "gastronomia": {
        "handle": "chefana.cozinha",
        "display_name": "Chef Ana Ribeiro",
        "brand_context": (
            "Chef Ana Ribeiro, especialista em cozinha italiana contemporanea, "
            "atende jantares privativos em Sao Paulo. Publico 30-55 anos, food lovers. "
            "Tom acolhedor mas tecnico, compartilha segredos de cozinha profissional. "
            "Diferencial: receitas 'de restaurante' acessiveis em casa."
        ),
        "image_style": (
            "Food photography editorial, luz natural, composicao minimalista, "
            "tons quentes (terracota, oliva, creme). Referencia: Bon Appetit, Kinfolk."
        ),
        "search_description": (
            "tendencias de gastronomia italiana, tecnicas de cozinha profissional, "
            "ingredientes da estacao e receitas para home cooks avancados em 2026"
        ),
        "fixed_hashtags": "#chefana #gastronomia #cozinhaitaliana",
    },
    "moda": {
        "handle": "lolastyle.br",
        "display_name": "Lola Martins — Stylist",
        "brand_context": (
            "Lola Martins, personal stylist com 8 anos de mercado. Publico feminino 28-45, "
            "profissionais urbanas que querem elevar o guarda-roupa sem gastar muito. "
            "Tom consultivo e direto, sem jargao de moda. "
            "Diferencial: foca em pecas versateis e longevidade, nao trends descartaveis."
        ),
        "image_style": (
            "Fashion editorial minimalista, paleta neutra (off-white, bege, preto) com "
            "um acento de cor viva por post. Tipografia serif elegante. "
            "Referencia: The Row, Toteme, Net-a-Porter."
        ),
        "search_description": (
            "tendencias de moda feminina, styling, pecas atemporais e capsule wardrobe em 2026"
        ),
        "fixed_hashtags": "#lolastyle #moda #stylisttips",
    },
    "juridico": {
        "handle": "dra.patricia.costa",
        "display_name": "Dra. Patricia Costa — OAB/SP",
        "brand_context": (
            "Dra. Patricia Costa, advogada especialista em direito do consumidor, "
            "OAB/SP ativa. Publico 25-60 anos, consumidores que querem entender seus direitos. "
            "Tom educativo e acolhedor, sempre respeitando o Codigo de Etica da OAB "
            "(nao pode prometer resultado nem captar cliente diretamente). "
            "Diferencial: traduz juridiques para linguagem simples com casos reais anonimizados."
        ),
        "image_style": (
            "Editorial profissional, tons neutros serios (azul navy, off-white, dourado discreto), "
            "tipografia serif classica, autoridade sem rigidez. Referencia: Harvard Law Review, FT."
        ),
        "search_description": (
            "direitos do consumidor, decisoes recentes do STJ, tendencias em direito digital "
            "e consumo em 2026 — respeitando o codigo de etica da OAB"
        ),
        "fixed_hashtags": "#direitodoconsumidor #oabsp #advogada",
    },
    "imobiliario": {
        "handle": "rafael.imoveis",
        "display_name": "Rafael Mendes — Corretor CRECI 54321",
        "brand_context": (
            "Rafael Mendes, corretor de imoveis com 10 anos em SP zona sul. "
            "Publico 28-55 anos, primeira ou segunda compra, perfil racional que quer numeros. "
            "Tom analitico, mostra conta, nao vende sonho. "
            "Diferencial: traz dados de mercado reais (CUB, Selic, m2) e compara opcoes."
        ),
        "image_style": (
            "Arquitetura fotografica minimalista, tons sobrios (concreto, madeira, verde-oliva), "
            "infograficos financeiros limpos com grafico e numeros. Referencia: Dezeen, Bloomberg."
        ),
        "search_description": (
            "tendencias do mercado imobiliario brasileiro, financiamento, taxa Selic, "
            "investimento em imoveis e precos de m2 em 2026"
        ),
        "fixed_hashtags": "#rafaelimoveis #mercadoimobiliario #imovelsp",
    },
    "educacao": {
        "handle": "profmarcos.estudos",
        "display_name": "Prof. Marcos — Metodo de Estudos",
        "brand_context": (
            "Prof. Marcos, educador com metodo proprio de estudos para vestibular e concursos. "
            "Publico 16-30 anos, vestibulandos e concurseiros. "
            "Tom proximo e motivacional, mas sempre com base cientifica (neurociencia do aprendizado). "
            "Diferencial: ensina a ESTUDAR, nao apenas conteudo."
        ),
        "image_style": (
            "Ilustracao editorial moderna tipo notebook/whiteboard, tons de papel creme e grafite, "
            "acentos em vermelho ou azul, tipografia handwritten misturada com sans. "
            "Referencia: Ali Abdaal, Thomas Frank, Notion."
        ),
        "search_description": (
            "tecnicas de estudo baseadas em neurociencia, produtividade, metodos de memorizacao "
            "e preparacao para vestibular/concursos em 2026"
        ),
        "fixed_hashtags": "#profmarcos #metododeestudos #vestibular",
    },
    "saude": {
        "handle": "dra.juliana.nutrologa",
        "display_name": "Dra. Juliana Alves — Nutrologa",
        "brand_context": (
            "Dra. Juliana Alves, nutrologa com CRM ativo, consultorio em Sao Paulo. "
            "Publico 30-55 anos, foco em saude preventiva e longevidade. "
            "Tom profissional e acolhedor, NUNCA promete cura ou resultado milagroso. "
            "Diferencial: une medicina baseada em evidencias com linguagem acessivel, "
            "sempre respeitando o Codigo de Etica Medica."
        ),
        "image_style": (
            "Editorial clinico moderno, paleta suave (branco quente, verde-oliva, terra), "
            "tipografia sans clean, composicoes arejadas. Referencia: Clue, Hims, Ro."
        ),
        "search_description": (
            "tendencias em saude preventiva, nutrologia, longevidade, saude intestinal "
            "e bem-estar baseado em evidencias em 2026 — respeitando o codigo de etica medica"
        ),
        "fixed_hashtags": "#drajuliana #nutrologia #saudepreventiva",
    },
}
