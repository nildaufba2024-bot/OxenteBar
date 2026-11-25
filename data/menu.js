/* Transcrição do CARDAPIO OXENTE.pdf, página única. Valores em reais. */
(() => {
  const categories = [
    ['beliscar','Beliscar',''],
    ['pastelzinho','Pastelzinho',''],
    ['bolinhos','Bolinhos','8 unidades por porção.'],
    ['caldos','Caldos',''],
    ['espetinhos','Espetinhos','Acompanha farofa e vinagrete.'],
    ['do-ar','Do Ar',''],
    ['da-terra','Da Terra','Fritas / aipim frito / farofa e vinagrete.'],
    ['do-mar','Do Mar',''],
    ['oxente-refeicoes','Oxente Refeições',''],
    ['pirao-de-aipim','Pirão de Aipim',''],
    ['oxente-kids','Oxente Kids','Três guarnições.'],
    ['porcoes','Porções',''],
    ['sobremesa','Sobremesa',''],
    ['tabuas-ou-chapas','Tábuas ou Chapas',''],
    ['cervejas','Cervejas',''],
    ['refrigerantes','Refrigerantes','']
  ].map(([id,label,description],order)=>({id,label,description,order,active:true,image:''}));
  const rows = {
    'beliscar': [
      ['Tó Evoluído',41],['Tó Frito',41],['Casal Raiz',36.90],['Danadinho',29.90],
      ['Chiquitinho de Carne',64.90],['Batata Tradicional',29.90],['Batata Especial',31.90],
      ['Dadinho de Tapioca',31.90],['Abara Recheado',29.90],['Queijo Coalho na Chapa',36.90],
      ['Arrumadinho',69.90],['Pastel de Camarão',22.90],['Pastel de Camarão c/Catupiry',23.90],
      ['Pastel Nordestino',21.90],['Pastel de Frango c/Queijo',21.90]
    ],
    'pastelzinho': [
      ['Pastelzinho (A)',32,'Sabores: carne, frango, queijos ou pizza.'],
      ['Pastelzinho (B)',33.90,'Sabores: camarão, carne do sol c/coalho, cupim ao molho ou charque c/queijo.'],
      ['Pastelzinho Mix',33.90]
    ],
    'bolinhos': [
      ['Queijos',28],['Calabresa c/Queijo',29.90],['Frango',29.90],['Feijoada',31],
      ['Charque c/Queijo',29.90],['Cupim ao Molho',29.90],['Carne do Sol c/Coalho',29.90],
      ['Camarão',31],['Kibe Carne',32],['Kibe Queijo',32],['Crocrete Bacalhau',32],
      ['Camarão Encapotado',46]
    ],
    'caldos': [['Sururu',19.90],['Mocotó',19.90],['Mariscadinha',19.90],['Camarão',19.90]],
    'espetinhos': [
      ['Frango',19],['Carne',19],['Cupim',21],['Carne do Sol',21],['Picanha',21],
      ['Camarão',21],['Queijo Coalho',19.90],['Carne + Frango',19.90],
      ['Medalhão Frango',23],['Medalhão de Filé',23],['Carne do Sol c/Queijo Coalho',20]
    ],
    'do-ar': [
      ['Codorna',22],['Moela c/Fatias de Pão',36.90],['Isca de Frango',41.90],
      ['Frango à Passarinho',39.90],['Coxinha da Asa',36.90]
    ],
    'da-terra': [
      ['Filezinho Molho Madeira',69.90],['Carne do Sol / Fumeiro',69.90],
      ['Costelinha Suína',64.90],['Picanha Aperitiva',79.90]
    ],
    'do-mar': [
      ['Isca de Peixe',59.90],['Casquinha de Siri',29.90],['Camarão Alho e Óleo',49.90],
      ['Peixe Frito (Vermelho)',69.90],['Filé de Camarão Empanado',69.90],
      ['Camarão Filé ao Azeite',69.90]
    ],
    'oxente-refeicoes': [
      ['Feijoada',79.90],['Sarapatel',64.90],['Rabada',69.90],['Picanha Acebolada',89.90],
      ['Carne do Sol c/Queijo Coalho',89.90],['Camarão Filé c/Queijo Coalho',96.90],
      ['Moqueca Camarão',119.90],['Moqueca Peixe',115],['Moqueca Mista',129],
      ['Bobó de Camarão',99]
    ],
    'pirao-de-aipim': [
      ['Carne de Sol / Fumeiro',79.90],['Cupim ao Molho',79.90],['Picanha',84.90],
      ['Camarão',89.90],['Soteropolitano',99],['Misto (2 Sabores)',89.90],
      ['Pirão de Banana c/Fumeiro',74.90]
    ],
    'oxente-kids': [['Filezinho Frango',27],['Filezinho Carne',27],['Nuguets',27]],
    'porcoes': [
      ['Arroz',10],['Farofa',10],['Vinagrete',10],['Feijão Tropeiro',12],
      ['Pirão Aipim',14],['Adicional Queijo Coalho',14],['Molho Extra',3],['Fatias de Pão',3]
    ],
    'sobremesa': [['MiniChurros',19.90],['Picolé',6],['Ambrósia',10.90,'Doce de leite.']],
    'tabuas-ou-chapas': [
      ['Chapa “La Ele”',119,'Linguiça mista, linguiça de frango, isca de cupim, queijo coalho.'],
      ['Chapa Nordestina',119,'Carne do sol, fritas e queijo coalho.'],
      ['Chapa Fi da Égua',129,'Isca de peixe, camarão e fritas.'],
      ['Chapa Churras',129,'Picanha, coxinha da asa e queijo coalho.'],
      ['Tábua Sertaneja',94.90,'Carne do sol, dadinho de tapioca, aipim frito e calabresa acebolada.'],
      ['Tábua do Mar',94.90,'Camarão ao alho e óleo, camarão encapotado, isca de peixe e bolinho de bacalhau.']
    ],
    'cervejas': [
      ['Heineken Long',13],['Corona Long',13],['Eisenbanh Long',10],
      ['Heineken 600ml',19],['Stella 600ml',17],['Spaten 600ml',16],
      ['Budweiser 600ml',14],['Eisenbanh 600ml',14],['Amstel 600ml',14.90],
      ['Brahma 600ml',14.90],['Devassa 600ml',12.90],['Itaipava 600ml',11]
    ],
    'refrigerantes': [['Garrafa KS 290ml',7],['Lata 350ml',7]]
  };
  const products=[];
  for(const category of categories){
    for(const [name,price,description=''] of rows[category.id]){
      const order=products.length;
      products.push({
        id:category.id+'-'+String(order+1).padStart(3,'0'),
        category:category.id,name,price,description,order,active:true,
        portion:category.id==='bolinhos'?'8 unidades':'',
        accompaniments:category.id==='espetinhos'?'Farofa e vinagrete.':'',
        variations:[]
      });
    }
  }
  const a=products.find(p=>p.name==='Pastelzinho (A)');
  a.variations=['Carne','Frango','Queijos','Pizza'].map(name=>({name,price:a.price}));
  const b=products.find(p=>p.name==='Pastelzinho (B)');
  b.variations=['Camarão','Carne do Sol c/Coalho','Cupim ao Molho','Charque c/Queijo'].map(name=>({name,price:b.price}));
  window.trMenu={
    categories,products,
    notices:[
      {id:'couvert',text:'Em dias de som ao vivo cobramos couvert artístico.'},
      {id:'embalagem',text:'Embalagem para viagem: R$ 3,00.'},
      {id:'filmagem',text:'Ao consumir neste local, você poderá estar sendo filmado para fins de segurança e redes sociais.'}
    ],
    review:[
      'Confirmar grafia impressa no PDF: Crocrete Bacalhau.',
      'Confirmar grafia impressa no PDF: Eisenbanh Long e Eisenbanh 600ml.',
      'Confirmar grafia impressa no PDF: Nuguets.'
    ]
  };
})();
